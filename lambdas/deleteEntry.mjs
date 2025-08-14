import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, DeleteCommand } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

export const handler = async (event) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Credentials": true,
    "Access-Control-Allow-Headers": "Content-Type,Authorization",
    "Access-Control-Allow-Methods": "OPTIONS,DELETE",
  };

  try {
    const userId = event.requestContext.authorizer.claims.sub;
    const { entryId } = event.pathParameters;

    if (!userId) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ message: "User is not authenticated." }),
      };
    }
    
    if (!entryId) {
        return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ message: "Entry ID is required." }),
        };
    }

    const command = new DeleteCommand({
      TableName: "JournalEntries",
      Key: {
        userId: userId,
        entryId: entryId,
      },
    });

    await docClient.send(command);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ message: "Entry deleted successfully" }),
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ message: "Error deleting entry", error: error.message }),
    };
  }
};