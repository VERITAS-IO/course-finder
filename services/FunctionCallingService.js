// services/functionCallingService.js
import dotenv from "dotenv";
import OpenAI from "openai";
import * as utils from "../utils.js";
import {
  availableFunctions,
  expandMessages,
  functions as functionList,
} from "../function.calling.js";
import { getCompletion } from "../openai.js";
import ApiError from "../models/errors/ApiError.js";

dotenv.config();
const openAiApiKey = process.env.OPENAI_API_KEY;
const openAiEndpoint = process.env.OPEN_AI_ENDPOINT;

const openAiClient = new OpenAI({ apiKey: openAiApiKey });

class FunctionCallingService {
  async getResponse(chatMessages, resourceFlags) {
    try {
      console.log("First Function Call Started");
      const firstFunctionCallStart = performance.now();
      const result = await getCompletion({
        client: openAiClient,
        messages: chatMessages,
        functions: functionList,
      });
      console.log("First Function Call Finished");
      const firstFunctionCallFinished = performance.now();
      console.log(
        "First Function Call Latency:",
        firstFunctionCallStart - firstFunctionCallFinished
      );
      console.log("**********************************************************");
      const responseMessage = result.choices[0].message;
      const functionName = responseMessage.function_call.name;
      const functionArguments = JSON.parse(
        responseMessage.function_call.arguments
      );
      functionArguments.resourceFlags = resourceFlags;
      const functionToCall = availableFunctions[functionName];
      const functionResponse = await functionToCall(functionArguments);

      const assistantExpanseMessage = {
        role: responseMessage.role,
        function_call: {
          name: functionName,
          arguments: JSON.stringify(functionArguments),
        },
        content: null,
      };

      const functionExpanseMessage = {
        role: "function",
        name: functionName,
        content: JSON.stringify(functionResponse),
      };

      const expansedMessages = expandMessages(
        chatMessages,
        assistantExpanseMessage,
        functionExpanseMessage
      );
      console.log("Second Function Call Started");
      const secondFunctionCallStarted = performance.now();
      const secondResponse = await getCompletion({
        client: openAiClient,
        messages: expansedMessages,
        functions: functionList,
        temperature: 0.4,
      });
      console.log("second Function Call Finished");
      const secondFunctionCallFinished = performance.now();
      console.log(
        "second Function Call Latency:",
        secondFunctionCallStarted - secondFunctionCallFinished
      );
      console.log("**********************************************************");

      const secondResponseMessage = secondResponse.choices[0].message.content;
      return secondResponseMessage;
    } catch (error) {
      console.log("The sample encountered an error: ", error);
      throw new ApiError(error?.message, error?.statusCode);
    }
  }
}

export default new FunctionCallingService();
