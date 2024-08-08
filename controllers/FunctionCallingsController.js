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

class FunctionCallingsController {
  constructor() {
    this.openAiClient = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }

  /**
   * Handles the request to get a response based on user input and resource flags.
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  getResponse = async (req, res, next) => {
    try {
      const { userInput, resourceFlags } = req.body;
      
      const chatMessages = this.createChatMessages(userInput);
      const finalResponse = await this.getServiceResponse(chatMessages, resourceFlags);
      
      const parsedResponse = this.parseResponse(finalResponse);
      
      res.status(200).json({ parsedResponse });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Creates the initial chat messages array.
   * @param {string} userInput - The input provided by the user
   * @returns {Array} An array of chat message objects
   */
  createChatMessages = (userInput) => {
    return [
      {
        role: "system",
        content: "Be precise, funny and give a humorous answer, not only list the videos, but explain them and create a natural response instead of listing links like a robot"
      },
      {
        role: "user",
        content: userInput
      }
    ];
  }

  /**
   * Fetches the response from the OpenAI API.
   * @param {Array} chatMessages - The array of chat messages
   * @param {Array} resourceFlags - The array of resource flags
   * @returns {Promise<string>} The final response
   */
  getServiceResponse = async (chatMessages, resourceFlags) => {
    try {
      console.log("First Function Call Started");
      const startTime = performance.now();

      const firstFunctionResponse = await this.performFirstFunctionCall(chatMessages);
      
      // if (!this.isValidFunctionResponse(firstFunctionResponse)) {
      //   return null;
      // }

      const expandedMessages = this.expandMessagesWithFunctionCall(chatMessages, firstFunctionResponse, resourceFlags);
      
      console.log("Second Function Call Started");
      const startTimeSecond = performance.now();

      const finalResponse = await this.performSecondFunctionCall(expandedMessages);
      
      this.logPerformance("First Function Call", startTime);
      this.logPerformance("Second Function Call", startTimeSecond);

      return finalResponse;
    } catch (error) {
      console.error("The sample encountered an error: ", error);
      throw new ApiError(error?.message, error?.statusCode);
    }
  }

  /**
   * Performs the first function call to OpenAI.
   * @param {Array} chatMessages - The array of chat messages
   * @returns {Promise<Object>} The result of the first function call
   */
  performFirstFunctionCall = async (chatMessages) => {
    const result = await getCompletion({
      client: this.openAiClient,
      messages: chatMessages,
      functions: functionList,
    });

    return result.choices[0].message;
  }

  /**
   * Checks if the function response is valid.
   * @param {Object} functionResponse - The response from the first function call
   * @returns {boolean} True if the response is valid, false otherwise
   */
  isValidFunctionResponse = (functionResponse) => {
    return functionResponse.youtube || functionResponse.udemy || 
           functionResponse.coursera || functionResponse.medium;
  }

  /**
   * Expands the chat messages with the function call.
   * @param {Array} chatMessages - The array of chat messages
   * @param {Object} responseMessage - The response from the first function call
   * @param {Array} resourceFlags - The array of resource flags
   * @returns {Array} The expanded chat messages
   */
  expandMessagesWithFunctionCall = (chatMessages, responseMessage, resourceFlags) => {
    const { name: functionName, arguments: functionArgs } = responseMessage.function_call;
    const parsedArgs = JSON.parse(functionArgs);
    parsedArgs.resourceFlags = resourceFlags;

    const functionToCall = availableFunctions[functionName];
    const functionResponse = functionToCall(parsedArgs);

    const assistantExpanseMessage = {
      role: responseMessage.role,
      function_call: {
        name: functionName,
        arguments: JSON.stringify(parsedArgs),
      },
      content: null,
    };

    const functionExpanseMessage = {
      role: "function",
      name: functionName,
      content: JSON.stringify(functionResponse),
    };

    chatMessages.push(this.getSystemInstructionMessage());

    return expandMessages(chatMessages, assistantExpanseMessage, functionExpanseMessage);
  }

  /**
   * Gets the system instruction message.
   * @returns {Object} The system instruction message
   */
  getSystemInstructionMessage = () => {
    return {
      role: "system",
      content: `For youtube, return answer in an object list format that includes url, channelName, thumbnailUrl etc. And For udemy, do the same thing but with udemy properties.
         If you have an extra joke, introduction before answer etc. anything but not related to course informations, also return them in an object with properties such as {..funnyEntrance etc..} 
         Return the response in a JSON format, I will parse it.`
    };
  }

  /**
   * Performs the second function call to OpenAI.
   * @param {Array} expandedMessages - The expanded chat messages
   * @returns {Promise<string>} The final response
   */
  performSecondFunctionCall = async (expandedMessages) => {
    const secondResponse = await getCompletion({
      client: this.openAiClient,
      messages: expandedMessages,
      functions: functionList,
      temperature: 0.4,
    });

    return secondResponse.choices[0].message.content;
  }

  /**
   * Logs the performance of a function call.
   * @param {string} functionName - The name of the function
   * @param {number} startTime - The start time of the function call
   */
  logPerformance = (functionName, startTime) => {
    const endTime = performance.now();
    console.log(`${functionName} Latency:`, endTime - startTime);
    console.log("*".repeat(60));
  }

  /**
   * Parses the JSON response.
   * @param {string} response - The JSON string response
   * @returns {Object} The parsed JSON object
   */
  parseResponse = (response) => {
    return JSON.parse(response);
  }
}

export default new FunctionCallingsController();