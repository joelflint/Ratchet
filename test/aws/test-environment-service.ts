import { expect } from 'chai';
import {BooleanRatchet} from "../../src/common/boolean-ratchet";
import * as AWS from 'aws-sdk';
import {S3CacheRatchet} from '../../src/aws/s3-cache-ratchet';
import {EnvironmentService} from '../../src/aws/environment-service';
import {Logger} from '../../src/common/logger';

describe('#environmentService', function() {
    this.timeout(30000);
    /*
    it('should throw exception on missing environment values', async() => {
        try {
            const vals: any = await EnvironmentService.getConfig('i_do_not_exist');
            this.bail();
        } catch (err) {
            expect(err).to.not.be.null;
            Logger.info('Success - threw %s',err);

        }

    });
    */

    /*
    it('should find a valid value', async() => {
        const vals: any = await EnvironmentService.getConfig('xxx', 'us-east-1', true);
        expect(vals).to.not.be.null;
    });

     */

});