// Import statements
import { createUrl } from "./utils.js";
import axios from "axios";
import cheerio from "cheerio";
import { getTopYouTubeLinksAndTitles } from "./webScrapping/puppeteer/youtube.js";
import resourceConstants from "./constants/ResourceConstants.js";
import {
  puppeteerJumpTable,
  cheerioJumpTable,
  apiClientsJumpTable,
} from "./jumpTables/index.js";
import SearchResourcesFromPlatformsResponse from "./models/response/SearchResultsFromPlatformsResponse.js";
import resourceConfig from "./config/resource.js";

// Available functions
export const availableFunctions = {
  searchCoursesFromYoutube,
  searchResourcesFromPlatforms,
  // Add other functions as they are implemented
  searchCoursesFromUdemy: null,
  searchCoursesFromCoursera: null,
  searchBlogsFromMedium: null,
};

// Function descriptions for API
export const functions = [
  {
    name: "searchResourcesFromPlatforms",
    description: "Get the best courses and blogposts' links from various platforms",
    parameters: {
      type: "object",
      properties: {
        topic: {
          type: "string",
          description: "The topic of the lesson (e.g., Azure, Power BI, JavaScript)",
        },
        level: {
          type: "string",
          description: "The learner's experience level (beginner, intermediate, advanced)",
        },
      },
      required: ["topic"],
    },
  },
];

/**
 * Searches for courses from YouTube based on a given topic and level.
 * @param {Object} props - An object containing the topic and level.
 * @returns {Promise<Object[]>} A Promise that resolves with an array of course information objects.
 */
export async function searchCoursesFromYoutube({ topic, level }) {
  const url = createUrl([topic, level, "course"], resourceConstants.YOUTUBE);
  return await getTopYouTubeLinksAndTitles(url);
}

/**
 * Searches for resources from multiple platforms.
 * @param {Object} params - Search parameters
 * @param {string} params.topic - The topic to search for
 * @param {string} params.level - The difficulty level
 * @param {string[]} params.resourceFlags - Platforms to search (e.g., ['youtube', 'udemy'])
 * @returns {Promise<SearchResourcesFromPlatformsResponse>} Search results
 */
export async function searchResourcesFromPlatforms({ topic, level, resourceFlags }) {
  const responses = {};

  await Promise.all(resourceFlags.map(async (flag) => {
    try {
      const url = createUrl([topic, level, "course"], flag);
      responses[flag] = await apiClientsJumpTable[flag.toUpperCase()](url);
    } catch (error) {
      console.error(`Error fetching data for ${flag}:`, error);
      responses[flag] = null;
    }
  }));

  return new SearchResourcesFromPlatformsResponse(responses);
}

/**
 * Expands the conversation messages by appending the assistant response and function response.
 * @param {Object[]} messages - An array of conversation messages.
 * @param {Object} assistantResponse - The response from the assistant.
 * @param {Object} functionResponse - The response from the function.
 * @returns {Object[]} An array of expanded conversation messages.
 */
export function expandMessages(messages, assistantResponse, functionResponse) {
  if (!assistantResponse || !functionResponse) {
    throw new Error("Assistant response or function response is undefined.");
  }

  return [...messages, assistantResponse, functionResponse];
}