import { DynamoDB } from 'aws-sdk';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

const dynamodb = new DynamoDB.DocumentClient();

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  
    const parsedBody = JSON.parse(event.body as string);
    const { userId, data } = JSON.parse(parsedBody.body);
  console.log('event.body:', event.body);
  try {
    // Update the user's userData
    await dynamodb.update({
      TableName: process.env.USER_TABLE_NAME as string,
      Key: { userId },
      UpdateExpression: 'SET userData = :data',
      ExpressionAttributeValues: {
        ':data': data,
      },
    }).promise();

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'User data added successfully' }),
    };
  } catch (error) {
    console.error('Error adding user data:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Internal Server Error' }),
    };
  }
};