import { StringRatchet } from '../../common/string-ratchet';
import { Logger } from '../../common/logger';
import { PromiseRatchet } from '../../common/promise-ratchet';
import { RequireRatchet } from '../../common/require-ratchet';
import fs, { WriteStream } from 'fs';
import { DynamoRatchet } from '../../aws';
import readline from 'readline';
import { QueryInput, ScanInput } from 'aws-sdk/clients/dynamodb';

export class DynamoExporter {
  private constructor() {}

  public static async importJsonLFileToTable(dynamo: DynamoRatchet, tableName: string, filename: string): Promise<number> {
    RequireRatchet.notNullOrUndefined(dynamo, 'dynamo');
    RequireRatchet.notNullOrUndefined(tableName, 'tableName');
    RequireRatchet.notNullOrUndefined(filename, 'filename');

    const fileStream = fs.createReadStream(filename);

    const rl = readline.createInterface({
      input: fileStream,
      crlfDelay: Infinity,
    });
    // Note: we use the crlfDelay option to recognize all instances of CR LF
    // ('\r\n') in input.txt as a single line break.

    let rval: number = 0;
    for await (const line of rl) {
      if (rval % 100 === 0) {
        Logger.info('Importing line %d', rval);
      }
      if (StringRatchet.trimToNull(line)) {
        const parsed: any = JSON.parse(line);
        await dynamo.simplePut(tableName, parsed);
        rval++;
      }
    }

    return rval;
  }

  public static async exportScanToJsonLFile(dynamo: DynamoRatchet, scan: ScanInput, filename: string): Promise<number> {
    RequireRatchet.notNullOrUndefined(dynamo, 'dynamo');
    RequireRatchet.notNullOrUndefined(scan, 'scan');
    RequireRatchet.notNullOrUndefined(filename, 'filename');
    const ws: WriteStream = fs.createWriteStream(filename);
    ws.on('end', () => {
      Logger.debug('Write complete');
    });

    const rval: number = await DynamoExporter.exportScanToJsonLWriteStream(dynamo, scan, ws);

    await PromiseRatchet.resolveOnEvent(ws, ['finish', 'close'], ['error']);
    ws.close();
    return rval;
  }

  public static async exportQueryToJsonLFile(dynamo: DynamoRatchet, qry: QueryInput, filename: string): Promise<number> {
    RequireRatchet.notNullOrUndefined(dynamo, 'dynamo');
    RequireRatchet.notNullOrUndefined(qry, 'qry');
    RequireRatchet.notNullOrUndefined(filename, 'filename');

    const ws: WriteStream = fs.createWriteStream(filename);
    ws.on('end', () => {
      Logger.debug('Write complete');
    });

    const rval: number = await DynamoExporter.exportQueryToJsonLWriteStream(dynamo, qry, ws);

    await PromiseRatchet.resolveOnEvent(ws, ['finish', 'close'], ['error']);
    ws.close();
    return rval;
  }

  public static async exportScanToJsonLWriteStream(dynamo: DynamoRatchet, scan: ScanInput, target: WriteStream): Promise<number> {
    RequireRatchet.notNullOrUndefined(dynamo, 'dynamo');
    RequireRatchet.notNullOrUndefined(scan, 'scan');
    RequireRatchet.notNullOrUndefined(target, 'target');

    const rval: number = await dynamo.fullyExecuteProcessOverScan(scan, async (row) =>
      DynamoExporter.writeItemToJsonLStream(row, target, false)
    );
    return rval;
  }

  public static async exportQueryToJsonLWriteStream(dynamo: DynamoRatchet, qry: QueryInput, target: WriteStream): Promise<number> {
    RequireRatchet.notNullOrUndefined(dynamo, 'dynamo');
    RequireRatchet.notNullOrUndefined(qry, 'qry');
    RequireRatchet.notNullOrUndefined(target, 'target');

    const rval: number = await dynamo.fullyExecuteProcessOverQuery(qry, async (row) =>
      DynamoExporter.writeItemToJsonLStream(row, target, false)
    );
    return rval;
  }
  public static writeItemToJsonLStream(item: any, target: WriteStream, includeNulls: boolean = false): void {
    if (!!item || includeNulls) {
      target.write(JSON.stringify(item) + '\n');
    }
  }
}
