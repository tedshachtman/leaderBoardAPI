import { DynamoDB } from 'aws-sdk';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

const dynamodb = new DynamoDB.DocumentClient();

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const { userId } = event.queryStringParameters as { userId: string };

  try {
    // Retrieve the user's data and array of userIds
    const result = await dynamodb.get({
      TableName: process.env.USER_TABLE_NAME as string,
      Key: { userId },
    }).promise();

    const userIds = result.Item?.userIds || [];
    const userDataPromises = userIds.map((id: string) =>
      dynamodb.get({
        TableName: process.env.USER_TABLE_NAME as string,
        Key: { userId: id },
      }).promise()
    );

    const userDataResults = await Promise.all(userDataPromises);
    const userData = userDataResults.map((res) => res.Item?.userData);

    return {
      statusCode: 200,
      body: JSON.stringify({ userData }),
    };
  } catch (error) {
    console.error('Error retrieving user data:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Internal Server Error' }),
    };
  }
};