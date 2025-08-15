import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";
import { randomUUID } from "crypto";

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

export const handler = async (event) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Credentials": true,
    "Access-Control-Allow-Headers": "Content-Type,Authorization",
    "Access-Control-Allow-Methods": "OPTIONS,POST",
  };

  try {
    if (!event.body) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ message: "Request body is missing." }),
      };
    }

    const requestBody = JSON.parse(event.body);
    const { title, content } = requestBody;
    
    const userId = event.requestContext.authorizer?.claims?.sub;
    if (!userId) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ message: "User is not authenticated." }),
      };
    }

    if (!title || !content) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ message: "Missing title or content." }),
      };
    }

    const entryId = randomUUID();
    const timestamp = new Date().toISOString();
    
    const command = new PutCommand({
      TableName: "JournalEntries",
      Item: {
        userId: userId,
        entryId: entryId,
        title: title,
        content: content,
        createdAt: timestamp,
        updatedAt: timestamp,
      },
    });

    await docClient.send(command);

    return {
      statusCode: 201,
      headers,
      body: JSON.stringify({
        message: "Entry created successfully",
        entry: { entryId, title, content, createdAt: timestamp},
      }),
    };
  } catch (error) {
    console.error(error);

    if (error instanceof SyntaxError) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ message: "Invalid JSON format in request body." }),
      };
    }

    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ message: "Error creating entry", error: error.message }),
    };
  }
};