import { Subject } from 'rxjs';
import { StringWritable } from '../stream/string-writable';
import { PassThrough } from 'stream';
import AWS from 'aws-sdk';
import { CsvRatchet } from './csv-ratchet';
import { PromiseRatchet } from '../common/promise-ratchet';
import { Logger } from '../common/logger';
import { S3CacheRatchet } from '../aws/s3-cache-ratchet';
import { DaemonProcessCreateOptions } from '../aws/daemon/daemon-process-create-options';
import { DaemonProcessState } from '../aws/daemon/daemon-process-state';
import { DaemonUtil } from '../aws/daemon/daemon-util';
import { LoggerLevelName } from '../common';

describe('#streamObjectsToCsv', function () {
  xit('should stream objects to a csv', async () => {
    // Logger.setLevel(LoggerLevelName.debug);
    const sub: Subject<TestItem> = new Subject<TestItem>();
    const out: StringWritable = new StringWritable();

    const prom: Promise<number> = CsvRatchet.streamObjectsToCsv<TestItem>(sub, out); //, opts);

    for (let i = 1; i < 6; i++) {
      Logger.debug('Proc : %d', i);
      sub.next({ a: i, b: 'test ' + i + ' ,,' });
      await PromiseRatchet.wait(1000);
    }
    sub.complete();

    Logger.debug('Waiting on write');

    const result: number = await prom;
    Logger.debug('Write complete');
    const val: string = out.value;

    expect(result).toEqual(5);
    Logger.debug('Have res : %d and val : \n%s', result, val);
  });

  xit('should stream objects to a csv', async () => {
    Logger.setLevel(LoggerLevelName.debug);
    const sub: Subject<TestItem> = new Subject<TestItem>();
    const out: PassThrough = new PassThrough();
    const s3: AWS.S3 = new AWS.S3({ region: 'us-east-1' });
    const cache: S3CacheRatchet = new S3CacheRatchet(s3, 'test-bucket');
    const key: string = 'test.csv';

    const newDaemonOptions: DaemonProcessCreateOptions = {
      title: 'test',
      contentType: 'text/csv',
      group: 'NA',
      meta: {},
      targetFileName: 'test.csv',
    };
    const t2: DaemonProcessState = await DaemonUtil.start(cache, key, key, newDaemonOptions);

    const dProm: Promise<DaemonProcessState> = DaemonUtil.streamDataAndFinish(cache, key, out);

    const prom: Promise<number> = CsvRatchet.streamObjectsToCsv<TestItem>(sub, out); //, opts);

    for (let i = 1; i < 6; i++) {
      Logger.debug('Proc : %d', i);
      sub.next({ a: i, b: 'test ' + i + ' ,,' });
      await PromiseRatchet.wait(1000);
    }
    sub.complete();

    Logger.debug('Waiting on write');

    const result: number = await prom;
    Logger.debug('Write complete');

    const val: DaemonProcessState = await dProm;

    expect(result).toEqual(5);
    Logger.debug('Have res : %d and val : \n%j', result, val);
  });
});

export interface TestItem {
  a: number;
  b: string;
}
