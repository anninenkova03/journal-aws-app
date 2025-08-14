import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, QueryCommand } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

export const handler = async (event) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Credentials": true,
    "Access-Control-Allow-Headers": "Content-Type,Authorization",
    "Access-Control-Allow-Methods": "OPTIONS,GET",
  };

  try {
    const userId = event.requestContext.authorizer.claims.sub;
    const dateParam = event.queryStringParameters?.date;

    if (!userId) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ message: "User is not authenticated." }),
      };
    }

    if (!dateParam) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ message: "Date parameter is missing." }),
      };
    }

    const startOfDay = `${dateParam}T00:00:00Z`;
    const endOfDay = `${dateParam}T23:59:59Z`;

    const command = new QueryCommand({
      TableName: "JournalEntries",
      IndexName: "userId-createdAt-index",
      KeyConditionExpression: "userId = :userId AND createdAt BETWEEN :start AND :end",
      ExpressionAttributeValues: {
        ":userId": userId,
        ":start": startOfDay,
        ":end": endOfDay,
      },
    });

    const { Items } = await docClient.send(command);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(Items || []),
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ message: "Error fetching entries", error: error.message }),
    };
  }
};
