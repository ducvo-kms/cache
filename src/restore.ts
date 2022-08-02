import * as cache from "@vanducvo/cache";
import * as core from "@actions/core";

import { Events, Inputs, State } from "./constants";
import * as utils from "./utils/actionUtils";
import { DownloadOptions } from "@vanducvo/cache/lib/options";

async function run(): Promise<void> {
    try {
        if (!utils.isCacheFeatureAvailable()) {
            utils.setCacheHitOutput(false);
            return;
        }

        // Validate inputs, this can cause task failure
        if (!utils.isValidEvent()) {
            utils.logWarning(
                `Event Validation Error: The event type ${
                    process.env[Events.Key]
                } is not supported because it's not tied to a branch or tag ref.`
            );
            return;
        }

        const primaryKey = core.getInput(Inputs.Key, { required: true });
        core.saveState(State.CachePrimaryKey, primaryKey);

        const restoreKeys = utils.getInputAsArray(Inputs.RestoreKeys);
        const cachePaths = utils.getInputAsArray(Inputs.Path, {
            required: true
        });

        const s3EndPoint = core.getInput(Inputs.S3Endpoint);
        const s3AccessKey = core.getInput(Inputs.S3AccessKey);
        const s3SecretKey = core.getInput(Inputs.S3SecretKey);
        const s3Region = core.getInput(Inputs.S3Region);
        const s3Bucket = core.getInput(Inputs.S3Bucket);

        const options: DownloadOptions = {
            useS3Sdk: s3EndPoint ? true : false,
            s3EndPoint: s3EndPoint,
            s3AccessKey: s3AccessKey,
            s3SecretKey: s3SecretKey,
            s3Region: s3Region,
            s3Bucket: s3Bucket,
            timeoutInMs: 600000
        };

        const cacheKey = await cache.restoreCache(
            cachePaths,
            primaryKey,
            restoreKeys,
            options
        );

        if (!cacheKey) {
            core.info(
                `Cache not found for input keys: ${[
                    primaryKey,
                    ...restoreKeys
                ].join(", ")}`
            );

            return;
        }

        // Store the matched cache key
        utils.setCacheState(cacheKey);

        const isExactKeyMatch = utils.isExactKeyMatch(primaryKey, cacheKey);
        utils.setCacheHitOutput(isExactKeyMatch);
        core.info(`Cache restored from key: ${cacheKey}`);
    } catch (error: unknown) {
        core.setFailed((error as Error).message);
    }
}

run();

export default run;
