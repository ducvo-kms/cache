export enum Inputs {
    Key = "key",
    Path = "path",
    RestoreKeys = "restore-keys",
    UploadChunkSize = "upload-chunk-size",
    S3Endpoint = "s3-endpoint",
    S3AccessKey = "s3-access-key",
    S3SecretKey = "s3-secret-key",
    S3Bucket = "s3-bucket",
    S3Region = "s3-region"
}

export enum Outputs {
    CacheHit = "cache-hit"
}

export enum State {
    CachePrimaryKey = "CACHE_KEY",
    CacheMatchedKey = "CACHE_RESULT"
}

export enum Events {
    Key = "GITHUB_EVENT_NAME",
    Push = "push",
    PullRequest = "pull_request"
}

export const RefKey = "GITHUB_REF";
