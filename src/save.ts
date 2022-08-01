import * as cache from "@vanducvo/cache";
import * as core from "@actions/core";

import { Events, Inputs, State } from "./constants";
import * as utils from "./utils/actionUtils";
import { UploadOptions } from "@vanducvo/cache/lib/options";

// Catch and log any unhandled exceptions.  These exceptions can leak out of the uploadChunk method in
// @actions/toolkit when a failed upload closes the file descriptor causing any in-process reads to
// throw an uncaught exception.  Instead of failing this action, just warn.
process.on("uncaughtException", e => utils.logWarning(e.message));

async function run(): Promise<void> {
    try {
        if (!utils.isCacheFeatureAvailable()) {
            return;
        }

        if (!utils.isValidEvent()) {
            utils.logWarning(
                `Event Validation Error: The event type ${
                    process.env[Events.Key]
                } is not supported because it's not tied to a branch or tag ref.`
            );
            return;
        }

        const state = utils.getCacheState();

        // Inputs are re-evaluted before the post action, so we want the original key used for restore
        const primaryKey = core.getState(State.CachePrimaryKey);
        if (!primaryKey) {
            utils.logWarning(`Error retrieving key from state.`);
            return;
        }

        if (utils.isExactKeyMatch(primaryKey, state)) {
            core.info(
                `Cache hit occurred on the primary key ${primaryKey}, not saving cache.`
            );
            return;
        }

        const cachePaths = utils.getInputAsArray(Inputs.Path, {
            required: true
        });

        const s3EndPoint = core.getInput(Inputs.S3Endpoint);
        const s3AccessKey = core.getInput(Inputs.S3AccessKey);
        const s3SecretKey = core.getInput(Inputs.S3SecretKey);
        const s3Region = core.getInput(Inputs.S3Region);
        const s3Bucket = core.getInput(Inputs.S3Bucket);

        const options: UploadOptions = {
            useS3Sdk: s3EndPoint ? true : false,
            s3EndPoint: s3EndPoint,
            s3AccessKey: s3AccessKey,
            s3SecretKey: s3SecretKey,
            s3Region: s3Region,
            s3Bucket: s3Bucket,
            uploadChunkSize: utils.getInputAsInt(Inputs.UploadChunkSize)
        };

        const cacheId = await cache.saveCache(cachePaths, primaryKey, options);

        if (cacheId != -1) {
            core.info(`Cache saved with key: ${primaryKey}`);
        }
    } catch (error: unknown) {
        utils.logWarning((error as Error).message);
    }
}

run();

export default run;
