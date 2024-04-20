import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import { Construct } from 'constructs';

export class LeaderBoardApiStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Create the DynamoDB table
    const userTable = new dynamodb.Table(this, 'UserTable', {
      partitionKey: { name: 'userId', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
    });

    userTable.addGlobalSecondaryIndex({
      indexName: 'UserDataIndex',
      partitionKey: { name: 'userId', type: dynamodb.AttributeType.STRING },
      projectionType: dynamodb.ProjectionType.ALL,
    });

    // Create the Lambda functions
    const updateLambda = new lambda.Function(this, 'UpdateLambda', {
      runtime: lambda.Runtime.NODEJS_16_X,
      handler: 'update.handler',
      code: lambda.Code.fromAsset('lambda'),
      environment: {
        USER_TABLE_NAME: userTable.tableName,
      },
    });

    const retrieveLambda = new lambda.Function(this, 'RetrieveLambda', {
      runtime: lambda.Runtime.NODEJS_16_X,
      handler: 'retrieve.handler',
      code: lambda.Code.fromAsset('lambda'),
      environment: {
        USER_TABLE_NAME: userTable.tableName,
      },
    });

    const addLambda = new lambda.Function(this, 'AddLambda', {
      runtime: lambda.Runtime.NODEJS_16_X,
      handler: 'add.handler',
      code: lambda.Code.fromAsset('lambda'),
      environment: {
        USER_TABLE_NAME: userTable.tableName,
      },
    });

    // Grant permissions to the Lambda functions
    userTable.grantReadWriteData(updateLambda);
    userTable.grantReadData(retrieveLambda);
    userTable.grantReadWriteData(addLambda);

    // Create the API Gateway
    const api = new apigateway.RestApi(this, 'UserApi');

    const userResource = api.root.addResource('users');

    userResource.addMethod('POST', new apigateway.LambdaIntegration(updateLambda));
    userResource.addMethod('GET', new apigateway.LambdaIntegration(retrieveLambda));
    userResource.addMethod('PUT', new apigateway.LambdaIntegration(addLambda));
  }
}
