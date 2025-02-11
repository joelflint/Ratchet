import { Logger } from '../common/logger';
import { PromiseRatchet } from '../common/promise-ratchet';
import { RequireRatchet } from '../common/require-ratchet';
import { ErrorRatchet } from '../common/error-ratchet';
import { EnvironmentServiceProvider } from './environment/environment-service-provider';
import { EnvironmentServiceConfig } from './environment/environment-service-config';
import { SsmEnvironmentServiceProvider } from './environment/ssm-environment-service-provider';
import { S3EnvironmentServiceProvider } from './environment/s3-environment-service-provider';

/**
 * Wraps up a EnvironmentServiceProvider and provides caching and retry-on-failure logic
 */
export class EnvironmentService<T> {
  private readPromiseCache: Map<string, Promise<any>> = new Map();

  public static defaultEnvironmentServiceConfig(): EnvironmentServiceConfig {
    const rval: EnvironmentServiceConfig = {
      maxRetries: 3,
      backoffMultiplierMS: 500,
    };
    return rval;
  }

  constructor(
    private provider: EnvironmentServiceProvider<T>,
    private cfg: EnvironmentServiceConfig = EnvironmentService.defaultEnvironmentServiceConfig()
  ) {
    RequireRatchet.notNullOrUndefined(provider);
    RequireRatchet.notNullOrUndefined(cfg);
  }

  public async getConfig(name: string): Promise<T> {
    Logger.silly('EnvService:Request to read config %s', name);
    if (!this.readPromiseCache.has(name)) {
      Logger.silly('EnvService: Nothing in cache - adding');
      this.readPromiseCache.set(name, this.getConfigUncached(name));
    }

    return this.readPromiseCache.get(name);
  }

  private async getConfigUncached(name: string): Promise<T> {
    let tryCount: number = 1;
    let rval: T = null;

    while (!rval && tryCount < this.cfg.maxRetries) {
      Logger.silly('Attempting fetch of %s', name);
      try {
        rval = await this.provider.fetchConfig(name);
      } catch (err) {
        const waitMS: number = tryCount * this.cfg.backoffMultiplierMS;
        Logger.info(
          'Error attempting to fetch config %s (try %d of %d, waiting %s MS): %s',
          name,
          tryCount,
          this.cfg.maxRetries,
          waitMS,
          err,
          err
        );
        await PromiseRatchet.wait(waitMS);
        tryCount++;
      }
    }

    if (!rval) {
      ErrorRatchet.throwFormattedErr('Was unable to fetch config %s even after %d retries', name, this.cfg.maxRetries);
    }
    return rval;
  }
}
