import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, UpdateCommand } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

export const handler = async (event) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Credentials": true,
    "Access-Control-Allow-Headers": "Content-Type,Authorization",
    "Access-Control-Allow-Methods": "OPTIONS,PUT",
  };

  try {
    if (!event.pathParameters || !event.pathParameters.entryId) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ message: "Missing entryId in path." }),
      };
    }

    if (!event.body) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ message: "Request body is missing." }),
      };
    }

    const { entryId } = event.pathParameters;
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

    if (!title && !content) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ message: "Nothing to update (title/content missing)." }),
      };
    }

    const updateFields = [];
    const expressionValues = { ":updatedAt": new Date().toISOString() };

    if (title) {
      updateFields.push("title = :title");
      expressionValues[":title"] = title;
    }
    if (content) {
      updateFields.push("content = :content");
      expressionValues[":content"] = content;
    }

    const updateExpression = `set ${updateFields.join(", ")}, updatedAt = :updatedAt`;

    const command = new UpdateCommand({
      TableName: "JournalEntries",
      Key: { userId, entryId },
      UpdateExpression: updateExpression,
      ExpressionAttributeValues: expressionValues,
      ConditionExpression: "attribute_exists(entryId) AND attribute_exists(userId)",
      ReturnValues: "ALL_NEW",
    });

    const result = await docClient.send(command);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        message: "Entry updated successfully",
        entry: result.Attributes,
      }),
    };
  } catch (error) {
    console.error(error);

    if (error.name === "ConditionalCheckFailedException") {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ message: "Entry not found." }),
      };
    }

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
      body: JSON.stringify({ message: "Error updating entry", error: error.message }),
    };
  }
};