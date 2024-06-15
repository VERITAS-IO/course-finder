import { createUrl } from "./utils.js";
import axios from "axios";
import cheerio from "cheerio";
import { getTopYouTubeLinksAndTitles } from "./webScrapping/puppeteer/youtube.js";
import resourceConstants from "./constants/ResourceConstants.js";
import {puppeteerJumpTable, cheerioJumpTable} from "./jumpTables/index.js";
import SearchResourcesFromPlatformsResponse from "./models/response/SearchResultsFromPlatformsResponse.js";
/**
 * An object containing available functions for the application.
 * @type {Object}
 * @property {Function} searchCoursesFromYoutube - A function to search for courses from YouTube based on a topic and level.
 */
export const availableFunctions = {
  searchCoursesFromYoutube: searchCoursesFromYoutube,
  searchCoursesFromUdemy: "",
  searchCoursesFromCoursera: "",
  searchBlogsFromMedium: "",
  searchResourcesFromPlatforms: searchResourcesFromPlatforms,
};

/**
 * An array describing the available functions and their parameters.
 * @type {Object[]}
 */
export const functions = [
  {
    name: "searchResourcesFromPlatforms",
    description:
      "Get the best courses and blogposts' links from youtube, udemy, coursera and medium",
    parameters: {
      type: "object",
      properties: {
        topic: {
          type: "string",
          description:
            "The topic that the lesson is covering (i.e. Azure, Power BI, JavaScript, Microservices, Clean Code, Generative AI, Blockchain etc.)",
        },
        level: {
          type: "string",
          description:
            "The level of experience the learner has prior to taking the course (i.e. beginner, intermediate, advanced)",
        },
      },
      required: ["topic"],
    },
  },
];

/**
 * Searches for courses from YouTube based on a given topic and level.
 * @param {Object} props - An object containing the topic and level.
 * @param {string} props.topic - The topic of the course.
 * @param {string} [props.level] - The level of the course (optional).
 * @returns {Promise<Object[]>} A Promise that resolves with an array of course information objects.
 */
export async function searchCoursesFromYoutube(props) {
  const { topic, level } = props;
  const url = createUrl([topic, level, "course"], resourceConstants.YOUTUBE);
  const results = await getTopYouTubeLinksAndTitles(url);
  return results;
}

export async function searchResourcesFromPlatforms({
  topic,
  level,
  resourceFlags,
}) {
  const responses = {};

  const promises = resourceFlags.map(async (flag) => {
    try {
      const url = createUrl([topic, level, "course"], flag);
      const response = await executeRelevantFunction(url, flag, "cheerio");
      responses[flag] = response;
    } catch (error) {
      console.error(`Error fetching data for flag ${flag}:`, error);
      responses[flag] = null; // Or any default value indicating failure
    }
  });
  try {
    await Promise.all(promises);
  } catch (error) {
    throw new Error("Error processing resource flags:", error);
  }

  return new SearchResourcesFromPlatformsResponse(
    responses[resourceConstants.YOUTUBE],
    responses[resourceConstants.UDEMY],
    responses[resourceConstants.COURSERA],
    responses[resourceConstants.MEDIUM]
  );
}

const executeRelevantFunction = async (url, resourceFlag, scrappingTool) => {
  try {
    switch (scrappingTool) {
      case "puppeteer":
        return await puppeteerJumpTable[resourceFlag.toUpperCase()](url);
      case "cheerio":
        return await cheerioJumpTable[resourceFlag.toUpperCase()](url);
      default:
        break;
    }
    
  } catch (error) {
    throw error;
  }
};

/**
 * Expands the conversation messages by appending the assistant response and function response.
 * @param {Object[]} messages - An array of conversation messages.
 * @param {Object} assistantResponse - The response from the assistant.
 * @param {Object} functionResponse - The response from the function.
 * @returns {Object[]} An array of expanded conversation messages.
 */
export function expandMessages(messages, assistantResponse, functionResponse) {
  try {
    // Check if assistantResponse or functionResponse is undefined
    if (
      typeof assistantResponse === "undefined" ||
      typeof functionResponse === "undefined"
    ) {
      throw new Error("Assistant response or function response is undefined.");
    }

    // Create a new array by spreading the existing messages and appending the assistant and function responses
    const expandedMessages = [...messages, assistantResponse, functionResponse];

    return expandedMessages;
  } catch (error) {
    console.error("An error occurred while expanding messages:", error.message);
    throw error;
  }
}
