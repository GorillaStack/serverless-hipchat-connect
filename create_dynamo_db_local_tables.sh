#!/bin/bash

for i in "$@"
do
  case $i in
    -e=*|--region=*)
      REGION="${i#*=}"
      # echo "--region was specified, parameter $REGION" >&2
      shift
      ;;
  esac
done

if [[ -z $REGION ]]; then
  echo "No '--region=...' argument specified.  Exiting..."
  exit 1
fi

REGION_MISSING_DASHES=`echo $REGION | tr -d '-'`
VARIABLE_FILE="./_meta/variables/s-variables-dev-${REGION_MISSING_DASHES}.json"
INSTALLATION_TABLE=`node -pe 'JSON.parse(process.argv[1]).installationTableName' "$(cat ${VARIABLE_FILE})"`
ACCESS_TOKEN_TABLE=`node -pe 'JSON.parse(process.argv[1]).accessTokenTableName' "$(cat ${VARIABLE_FILE})"`

if [[ -z $INSTALLATION_TABLE || -z $ACCESS_TOKEN_TABLE ]]; then
  echo "No INSTALLATION_TABLE or ACCESS_TOKEN_TABLE found in _meta/variables for region $REGION.  Exiting..."
  exit 1
fi

echo INSTALLATION_TABLE=$INSTALLATION_TABLE
echo ACCESS_TOKEN_TABLE=$ACCESS_TOKEN_TABLE

# Create the InstallationTable
aws dynamodb create-table --table-name $INSTALLATION_TABLE --attribute-definitions AttributeName="oauthId",AttributeType="S" --key-schema AttributeName="oauthId",KeyType="HASH" --provisioned-throughput ReadCapacityUnits=3,WriteCapacityUnits=1 --region $REGION --endpoint-url http://localhost:8000

# Create the AccessTokenTable
aws dynamodb create-table --table-name $ACCESS_TOKEN_TABLE --attribute-definitions AttributeName="oauthId",AttributeType="S" --key-schema AttributeName="oauthId",KeyType="HASH" --provisioned-throughput ReadCapacityUnits=3,WriteCapacityUnits=1 --region $REGION --endpoint-url http://localhost:8000
