#!/usr/bin/env node

import { Logger } from '../common/logger.js';
import { PublishCiReleaseToSlack } from '../node-only/ci/publish-ci-release-to-slack.js';
import { CliRatchet } from '../node-only/common/cli-ratchet.js';

if (
  process?.argv?.length &&
  CliRatchet.isCalledFromCLI(['ratchet-publish-ci-release-to-slack.js', 'ratchet-publish-ci-release-to-slack'])
) {
  PublishCiReleaseToSlack.runFromCliArgs(process.argv)
    .then((out) => {
      Logger.info('Result : %s', out);
    })
    .catch((err) => Logger.error('Failed : %s', err));
} else {
  // Ignore it - they weren't trying to run you
}
