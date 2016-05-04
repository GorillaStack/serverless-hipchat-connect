# serverless-hipchat-connect

This is a repository originally written by [GorillaStack](www.gorillastack.com) to demonstrate how to build plugins for HipChat using Atlassian Connect and how to host them using AWS serverless technologies.

## Components

|| Component || Purpose ||
| [serverless](https://github.com/serverless/serverless) | Framework for deploying lambda, API Gateway and other components to AWS |
| | |

## Usage

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
