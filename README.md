# serverless-hipchat-connect

[![serverless](http://public.serverless.com/badges/v3.svg)](http://www.serverless.com)
[![Codeship Status for gorillastack/serverless-hipchat-connect](https://codeship.com/projects/1786e1b0-f7a9-0133-bcde-36c15ad78253/status?branch=master)](https://codeship.com/projects/150721)

This is a repository originally written by [GorillaStack](www.gorillastack.com) to demonstrate how to build plugins for HipChat using Atlassian Connect and how to host them using AWS serverless technologies.

## Components

Component | Purpose | Description
----------|---------|------------
[serverless](https://github.com/serverless/serverless) | Application hosting | Framework for deploying lambda, API Gateway and other components to AWS
[Winston](https://www.npmjs.com/package/winston) | Logging | Good logging solution with a variety of [transports](https://github.com/winstonjs/winston/blob/master/docs/transports.md) including AWS SNS, Email, MongoDB, Console, File etc.


## Usage

1. Install serverless: `npm install serverless -g`
1. Deploy into a new AWS account `sls project init`
1. Deploy resources (IAM roles etc) `sls resources deploy`
1. Deploy endpoints and lambdas `sls dash deploy`
1. Deploy client-side resources `grunt copy && sls client deploy` (see note below)
1. Get function logs `sls function logs restApi/example/healthcheck`
1. Run locally:

    ngrok http -subdomain <subdomain> 3000
    sls offline start

### Client assets to s3

Client assets are copied to the s3 bucket defined in `s-project.json` by the [serverless-client-s3 plugin](https://github.com/serverless/serverless-client-s3).

```json
"custom": {
  "client": {
    "bucketName": "serverless-hipchat-connect-client.${stage}.${region}"
  }
  ...
}
```

Be sure to set this bucket name in your project, as bucket names need to be unique within AWS regions.

There are then two steps to deploy.  First of all, use grunt to copy the client source from the `client/src/` to the `client/dist/` directory that the plugin utilises.

```bash
$ grunt copy
```

Then, deploy the client assets to s3

```bash
$ sls client deploy
```
