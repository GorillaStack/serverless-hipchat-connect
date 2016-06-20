# serverless-hipchat-connect

[![serverless](http://public.serverless.com/badges/v3.svg)](http://www.serverless.com)
[![Codeship Status for gorillastack/serverless-hipchat-connect](https://codeship.com/projects/1786e1b0-f7a9-0133-bcde-36c15ad78253/status?branch=master)](https://codeship.com/projects/150721)

This is a repository originally written by [GorillaStack](www.gorillastack.com) to demonstrate how to build plugins for HipChat using Atlassian Connect and how to host them using AWS serverless technologies.

## Components

Component | Purpose | Description
----------|---------|------------
[serverless](https://github.com/serverless/serverless) | Application hosting | Framework for deploying lambda, API Gateway and other components to AWS
[serverless-offline](https://github.com/dherault/serverless-offline) | Local testing | A Serverless plugin that emulates lambda and api gateway on your local machine to speed up development cycles
[serverless-client](https://github.com/serverless/serverless-client-s3) | Deploy static files to s3 | A Serverless plugin that deploys static files to s3
[DynamoDBLocal](#working-with-dynamodb-local) | Local DB | A local emulation of DynamoDB, to speed up development cycles
[Winston](https://www.npmjs.com/package/winston) | Logging | Good logging solution with a variety of [transports](https://github.com/winstonjs/winston/blob/master/docs/transports.md) including AWS SNS, Email, MongoDB, Console, File etc.


## Getting Started

### Dependencies

1. Install serverless: `npm install serverless -g`
1. Install grunt-cli: `npm install grunt-cli -g`
1. Install serverless project dependencies: `npm install`
1. Install lambda code dependencies: `pushd restApi && npm install && popd`

### Run Locally / Dev Loop

After installing the "Dependencies" above:

##### In one terminal run ngrok to expose localhost to the outside world:

1. Open ngrok tunnel: `ngrok http 3000`
1. Put tunnel url into `restApi/config.json` under `host:` for `dev`

##### In one terminal run babel:

Run `grunt run:babel` to transpile continuously on changes

##### In one terminal serve static assets:

Run `grunt run:s3-local`

Now modify files in `client/src`.  To fill in stage configuration and make changes appear, either interrupt (^C) and rerun the command above, or run `grunt copy:dev`.

##### In one terminal, run DynamoDBLocal ([see instructions below](#working-with-dynamodb-local))

Run `java -Djava.library.path=./DynamoDBLocal_lib -jar DynamoDBLocal.jar` from the folder containing your DynamoDBLocal install jar file

First time you run this, you will need to create your DynamoDB local tables to match those created for your 'dev' stage.  We created a script to do this for you. Simply substitute in the region you initialised this stage in.

`grunt run:create-local-dynamodb-tables --region=<aws_region(e.g. ap-northeast-1)>`

##### In one terminal, run serverless offline:

Run locally: `sls offline start` (emulating API Gateway)

Then go to http://localhost:8010 in your web browser to install the plugin.


### Deploy a Stage

After installing the "Dependencies" above:

1. Transpile the lambda code: `grunt run:babel-once` (transpiles just once, not in watch mode)
1. Deploy resources a new AWS account, region and project stage: `sls project init` (ignore warnings, just takes a little time for CloudFormation to create resources referenced in variables)
1. Deploy endpoints and lambdas `sls dash deploy`
1. Deploy client-side resources for your environment `grunt copy:beta && sls client deploy --stage beta` (see note below)
1. Get function logs `sls function logs healthcheck`

### Client assets to s3

Client assets are copied to the s3 bucket defined in `s-project.json` by the [serverless-client-s3 plugin](https://github.com/serverless/serverless-client-s3).

We also support the substitution of config values from your environment specific configuration within `config.json`.  `grunt copy:prod` for example will substitute configuration values from the 'prod' subdocument of the config document.

```json
"custom": {
  "client": {
    "bucketName": "${name}-client.${stage}.${region}"
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

### Working with DynamoDB Local

When working in development mode, it helps to connect to a local DynamoDB.  Here is a quick setup guide.  More information on the [AWS Blog](https://aws.amazon.com/blogs/aws/dynamodb-local-for-desktop-development/)

1. Download the [DynamoDB Local JAR file](http://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Tools.DynamoDBLocal.html)
1. Start DynamoDB Local using this command: `java -Djava.library.path=./DynamoDBLocal_lib -jar DynamoDBLocal.jar`
1. Interface with DynamoDB Local via the API or CLI as you normally would, just setting the endpoint to be `http://localhost:8000`

##### Accessing DynamoDB via CLI

The AWS CLI for DynamoDB takes an option `--endpoint`.  By setting this to the DynamoDB Local url, we can target the DynamoDB Local using standard AWS CLI commands.

e.g.
```bash
$ aws dynamodb list-tables --endpoint-url http://localhost:8000 --region <your-region>
```

Create Installation and AccessToken tables used in boilerplate
*NB:* DynamoDB Local is region sensitive!  Be sure to create tables locally in whatever region your code thinks it will be in (set in process.env.SERVERLESS_REGION in your code).
```bash
#!/bin/bash

# Create the InstallationTable
aws dynamodb create-table --table-name InstallationTable --attribute-definitions AttributeName="oauthId",AttributeType="S" --key-schema AttributeName="oauthId",KeyType="HASH" --provisioned-throughput ReadCapacityUnits=3,WriteCapacityUnits=1 --region <your-region> --endpoint-url http://localhost:8000

# Create the AccessTokenTable
aws dynamodb create-table --table-name AccessTokenTable --attribute-definitions AttributeName="oauthId",AttributeType="S" --key-schema AttributeName="oauthId",KeyType="HASH" --provisioned-throughput ReadCapacityUnits=3,WriteCapacityUnits=1 --region <your-region> --endpoint-url http://localhost:8000
```

##### Accessing DynamoDB via API

We handle this logic in the boilerplate already.  When the IS_OFFLINE environment flag is set (which is the case when the Serverless offline plugin is running), if the SERVERLESS_STAGE (i.e. 'dev', 'beta', 'prod', 'v1', etc.) has `dynamoDBLocalURL` and `useDynamoDBLocal` set in configuration, DynamoDB Local will be targeted automatically in the boilerplate code.
