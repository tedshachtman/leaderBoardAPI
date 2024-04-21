import { DynamoDB } from 'aws-sdk';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

const dynamodb = new DynamoDB.DocumentClient();

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const parsedBody = JSON.parse(event.body as string);
    const { userId1, userId2 } = JSON.parse(parsedBody.body);
console.log('event.body:', event.body);
  try {
    // Update the first user's array of userIds
    await dynamodb.update({
      TableName: process.env.USER_TABLE_NAME as string,
      Key: { userId: userId1 },
      UpdateExpression: 'SET userIds = list_append(if_not_exists(userIds, :empty_list), :userId)',
      ExpressionAttributeValues: {
        ':empty_list': [],
        ':userId': [userId2],
      },
    }).promise();

    // Update the second user's array of userIds
    await dynamodb.update({
      TableName: process.env.USER_TABLE_NAME as string,
      Key: { userId: userId2 },
      UpdateExpression: 'SET userIds = list_append(if_not_exists(userIds, :empty_list), :userId)',
      ExpressionAttributeValues: {
        ':empty_list': [],
        ':userId': [userId1],
      },
    }).promise();

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'User IDs updated successfully' }),
    };
  } catch (error) {
    console.error('Error updating user IDs:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Internal Server Error' }),
    };
  }
};