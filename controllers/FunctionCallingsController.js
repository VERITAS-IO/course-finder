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

      const chatMessages =
        this.createChatMessagesForFirstFunctionCall(userInput);
      const finalResponse = await this.getServiceResponse(
        chatMessages,
        resourceFlags
      );

      console.log("finaleResponse:", finalResponse);

      if (!finalResponse) {
        return res.status(200).json(null);
      }      

      const cleanFinalResponse = finalResponse.replace(/```json\n|\n```/g, '');
      console.log("cleanFinalResponse:", cleanFinalResponse);
      const response = this.parseResponse(cleanFinalResponse);

      return res.status(200).json({ response });
    } catch (error) {
      next(error);
    }
  };
  /**
   * Creates the initial chat messages array.
   * @param {string} userInput - The input provided by the user
   * @returns {Array} An array of chat message objects
   */
  createChatMessagesForFirstFunctionCall = (userInput) => {
    return [
      {
        role: "system",
        content: `
           Based on the user input:
           1. You should asesss the purpouse of this user.
           2. You should understand what this user is trying to learn.
           3. You should understand what is the skillset, experience or level of this user. 
           4. Based on these information that you've extracted from user input, return the you should always return function_call that includes the topic(the thing user want to learn) and the level(users' level, exprience or skillset on the topic.)
           5. You should never include an entrance string, or explanation etc. Your aim is to create the function_call response. It should not be empty, your should always create it.
           `,
      },
      {
        role: "user",
        content: userInput,
      },
    ];
  };

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

      const firstFunctionResponse = await this.performFirstFunctionCall(
        chatMessages
      );

      if (!firstFunctionResponse) {
        return null;
      }

      // if (!this.isValidFunctionResponse(firstFunctionResponse)) {
      //   return null;
      // }

      console.log("firstFunctionResponse:", firstFunctionResponse);

      const expandedMessages = await this.expandMessagesWithFunctionCall(
        chatMessages,
        firstFunctionResponse,
        resourceFlags
      );

      console.log("Second Function Call Started");
      const startTimeSecond = performance.now();

      const finalResponse = await this.performSecondFunctionCall(
        expandedMessages
      );

      this.logPerformance("First Function Call", startTime);
      this.logPerformance("Second Function Call", startTimeSecond);

      return finalResponse;
    } catch (error) {
      console.error("The sample encountered an error: ", error);
      throw new ApiError(error?.message, error?.statusCode);
    }
  };

  /**
   * Performs the first function call to OpenAI.
   * @param {Array} chatMessages - The array of chat messages
   * @returns {Promise<Object>} The result of the first function call
   */
  performFirstFunctionCall = async (chatMessages) => {
    try {
      const result = await getCompletion({
        client: this.openAiClient,
        messages: chatMessages,
        functions: functionList,
      });

      const message = structuredClone(result.choices[0].message);

      console.log("first function response:", message);
      if (!message.function_call) {
        return null;
      }

      const level = "beginner";

      const argumentList = JSON.parse(message.function_call.arguments);
      
      console.log("message content:", message.content);
      const content = JSON.parse(message.content);

      if (level in argumentList === false) {
        argumentList.level = content?.level || level; 
        argumentList.level = level;
        message.function_call.arguments = JSON.stringify(argumentList);
      }

      return message;
    } catch (error) {
      throw error;
    }
  };

  /**
   * Checks if the function response is valid.
   * @param {Object} functionResponse - The response from the first function call
   * @returns {boolean} True if the response is valid, false otherwise
   */
  isValidFunctionResponse = (functionResponse) => {
    return (
      functionResponse.youtube ||
      functionResponse.udemy ||
      functionResponse.coursera ||
      functionResponse.medium
    );
  };

  /**
   * Expands the chat messages with the function call.
   * @param {Array} chatMessages - The array of chat messages
   * @param {Object} responseMessage - The response from the first function call
   * @param {Array} resourceFlags - The array of resource flags
   * @returns {Array} The expanded chat messages
   */
  expandMessagesWithFunctionCall = async (
    chatMessages,
    responseMessage,
    resourceFlags
  ) => {
    const { name: functionName, arguments: functionArgs } =
      responseMessage.function_call;
    const parsedArgs = JSON.parse(functionArgs);
    parsedArgs.resourceFlags = resourceFlags;

    const functionToCall = availableFunctions[functionName];
    const functionResponse = await functionToCall(parsedArgs);

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

    return expandMessages(
      chatMessages,
      assistantExpanseMessage,
      functionExpanseMessage
    );
  };

  /**
   * Gets the system instruction message.
   * @returns {Object} The system instruction message
   */
  getSystemInstructionMessage = () => {
    return {
      role: "system",
      content: `For YouTube, return the answer in an object list format that includes url, channelName, thumbnailUrl, etc. For Udemy, do the same but with Udemy properties. The response should be in JSON format.
        1. Your response should always be in the same format, as we are parsing it.
        2. Return it like the following:
        {
          "youtube": [
          {
          videoTitle: 'YUMURTA VERİMİ ARTIRMA %100 ETKİLİ YÖNTEM - TAVUKLAR YUMURTLAMIYORSA - TAVUKLARI YUMURTLATAN TARİF',
            urlPath: 'https://www.youtube.com/watch?v=hkbblNINuHU',
            imageUrl: 'https://i.ytimg.com/vi/hkbblNINuHU/hqdefault.jpg',
            ownerName: 'AUSTRALORP',
            likeCount: '1151',
            commentCount: '221',
            description: '#australorp #yumurtatoplama #civciv',
            rating: ...
          }
          ...other videos
          ] 
        }
        3. You should NEVER, EVER INCLUDE A TEXT BEFORE json object. Just return the JSON object. Nothing else. No introduction text, not explanation etc. Nothing.Just bring the json in the structure above.
        4.Do the same thing for every resource that we've asked you, whether its udemy or coursera etc.`,
          };
    };

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

    const response = secondResponse.choices[0].message.content; 
    return response;
  };

  /**
   * Logs the performance of a function call.
   * @param {string} functionName - The name of the function
   * @param {number} startTime - The start time of the function call
   */
  logPerformance = (functionName, startTime) => {
    const endTime = performance.now();
    console.log(`${functionName} Latency:`, endTime - startTime);
    console.log("*".repeat(60));
  };

  /**
   * Parses the JSON response.
   * @param {string} response - The JSON string response
   * @returns {Object} The parsed JSON object
   */
  parseResponse = (response) => {
    return JSON.parse(response);
  };
}

export default new FunctionCallingsController();
