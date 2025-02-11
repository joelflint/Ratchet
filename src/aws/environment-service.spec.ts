import { EnvironmentService } from './environment-service';
import { Logger } from '../common/logger';
import { SsmEnvironmentServiceProvider } from './environment/ssm-environment-service-provider';
import { S3EnvironmentServiceProvider } from './environment/s3-environment-service-provider';
import { LoggerLevelName } from '../common';

describe('#environmentService', function () {
  xit('should throw exception on missing environment values', async () => {
    try {
      const es: EnvironmentService<any> = new EnvironmentService(new SsmEnvironmentServiceProvider('us-east-1', true));
      const vals: any = await es.getConfig('i_do_not_exist');
      this.bail();
    } catch (err) {
      expect(err).toBeTruthy();
      Logger.info('Success - threw %s', err);
    }
  });

  xit('should find a valid value', async () => {
    const es: EnvironmentService<any> = new EnvironmentService(new SsmEnvironmentServiceProvider('us-east-1', true));
    const vals: any = await es.getConfig('xxx');
    expect(vals).toBeTruthy();
  });

  xit('should load config from s3', async () => {
    Logger.setLevel(LoggerLevelName.silly);
    const bucket: string = 'xxx';
    const path: string = 'yyy';

    const es: EnvironmentService<any> = new EnvironmentService<any>(
      new S3EnvironmentServiceProvider({ bucketName: bucket, region: 'us-east-1' })
    );
    const vals: any = await es.getConfig(path);
    const vals1: any = await es.getConfig(path);
    const vals2: any = await es.getConfig(path);
    expect(vals).toBeTruthy();
  });
});
