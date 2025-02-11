import AWS, { AWSError } from 'aws-sdk';
import { Logger } from '../../common/logger';
import { GetParameterResult } from 'aws-sdk/clients/ssm';
import { PromiseResult } from 'aws-sdk/lib/request';
import { PromiseRatchet } from '../../common/promise-ratchet';
import { RequireRatchet } from '../../common/require-ratchet';
import { ErrorRatchet } from '../../common/error-ratchet';
import { EnvironmentServiceProvider } from './environment-service-provider';
import { StringRatchet } from '../../common/string-ratchet';
import { NodeRatchet } from '../../node-only/common/node-ratchet';

/**
 * Service for reading environmental variables
 * Also hides the decryption detail from higher up services
 */
export class EnvVarEnvironmentServiceProvider<T> implements EnvironmentServiceProvider<T> {
  public constructor(private envVarName: string) {
    RequireRatchet.notNullOrUndefined(envVarName);
  }

  public async fetchConfig(): Promise<T> {
    Logger.silly('EnvVarEnvironmentServiceProvider fetch for %s', name);

    let rval: T = null;
    const toParse: string = StringRatchet.trimToNull(NodeRatchet.fetchProcessEnvVar(this.envVarName));

    // If we reach here with a string result, try to parse it
    if (toParse) {
      try {
        rval = JSON.parse(toParse);
      } catch (err) {
        Logger.error('Failed to read env - null or invalid JSON : %s : %s', err, toParse, err);
        throw err;
      }
    } else {
      ErrorRatchet.throwFormattedErr('Could not find env var with name : %s', this.envVarName);
    }
    return rval;
  }
}
