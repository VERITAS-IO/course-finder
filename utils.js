//utils.js

import { resourceConstants, rootUrls } from "./constants/index.js"; // Ensure you have the correct path to your constants file
import { buildYoutubeParams } from "./config/axios/youtube.js";
import dotenv from "dotenv";
dotenv.config();

/**
 * Validates the input parameters.
 * @param {string[]} keywords - An array of keywords to be used in the search.
 * @param {string} resourceFlag - The flag indicating which resource platform to use.
 * @throws Will throw an error if the validation fails.
 */
const validateParams = (keywords, resourceFlag) => {
  if (!Array.isArray(keywords) || keywords.length === 0) {
    throw new Error("Keywords must be a non-empty array.");
  }

  if (typeof resourceFlag !== "string") {
    throw new Error("Resource flag must be a string.");
  }

  if (!Object.values(resourceConstants).includes(resourceFlag)) {
    throw new Error("Invalid resource flag.");
  }
};

/**
 * Creates a query string from an array of keywords.
 * @param {string[]} keywords - An array of keywords to be used in the query string.
 * @param {string} resourceFlag - The flag indicating which resource platform to use.
 * @returns {string} The query string concatenated with the keywords.
 */
export const createQuery = (keywords, resourceFlag) => {
  validateParams(keywords, resourceFlag);
  const queryString = keywords.join("+");
  switch (resourceFlag) {
    case resourceConstants.YOUTUBE:
      return createYoutubeQuery(keywords);
    case resourceConstants.UDEMY:
      const encodedKeywords = keywords
        .map((keyword) => encodeURIComponent(keyword))
        .join("+");
      return `courses/?page=1&page_size=10&search=${encodedKeywords}&ordering=highest-rated`;
    case resourceConstants.COURSERA:
      return `search?query=${queryString}`;
    case resourceConstants.MEDIUM:
      return `search?q=${queryString}`;
    default:
      throw new Error("Invalid resource flag."); // This line should never be reached due to validation
  }
};

/**
 * Creates the query string for a YouTube search request based on provided keywords.
 *
 * @param {string[]} keywords - An array of keywords to include in the search query.
 * @returns {string} The query string for the YouTube API request.
 */
const createYoutubeQuery = (keywords) => { //blockchain, beginner
  let searchQuery = keywords.join(" ");
  let params = buildYoutubeParams(searchQuery);
  const query = new URLSearchParams(params).toString();
  return query;
};

/**
 * Creates a full URL for a resource search based on the given keywords.
 * @param {string[]} keywords - An array of keywords to be used in the search.
 * @param {string} resourceFlag - The flag indicating which resource platform to use.
 * @returns {string} The complete URL for the resource search.
 */
export const createUrl = (keywords, resourceFlag) => {
  validateParams(keywords, resourceFlag);
  switch (resourceFlag) {
    case resourceConstants.YOUTUBE:
      return `${rootUrls.YOUTUBE}${createQuery(
        keywords,
        resourceConstants.YOUTUBE
      )}`;
    case resourceConstants.UDEMY:
      return `${rootUrls.UDEMY}/${createQuery(
        keywords,
        resourceConstants.UDEMY
      )}`;
    case resourceConstants.COURSERA:
      return `${rootUrls.COURSERA}/${createQuery(
        keywords,
        resourceConstants.COURSERA
      )}`;
    case resourceConstants.MEDIUM:
      return `${rootUrls.MEDIUM}/${createQuery(
        keywords,
        resourceConstants.MEDIUM
      )}`;
    default:
      throw new Error("Invalid resource flag."); // This line is more for safety; it should never be reached.
  }
};



/**
 * Generates the Basic Authentication header for Udemy API requests.
 *
 * @returns {string} The Basic Authentication header.
 */
const createUdemyAuth = () => {
  const basicAuth = `Basic ${Buffer.from(
    `${process.env.UDEMY_CLIENT_IDENTITY}:${process.env.UDEMY_CLIENT_KEY}`
  ).toString("base64")}`;
  return basicAuth;
};

/**
 * Generates the Authentication header for YouTube API requests.
 *
 * @returns {null} Since no authentication is required for YouTube, it returns null.
 */
const createYoutubeAuth = () => {
  return null;
};

/**
 * Generates the appropriate Authentication header based on the provided flag.
 * @param {string} resourceFlag - The flag indicating which authentication to create.
 * @returns {string|null} The generated Authentication header, or an empty string if the resourceFlag does not match.
 */
export const createAuth = (resourceFlag) => {
  switch (resourceFlag) {
    case resourceConstants.UDEMY:
      return createUdemyAuth();
    case resourceConstants.YOUTUBE:
      return createYoutubeAuth();
    default:
      return "";
  }
};


export function updateUrlQueryParams(baseUrl, { removeKeys = [], updateParams = {} }) {
  // Create a URL object
  let url = new URL(baseUrl);

  // Create a URLSearchParams object from the URL's existing search parameters
  let params = new URLSearchParams(url.search);

  // Remove query parameters based on the provided keys
  removeKeys.forEach(key => {
    if (params.has(key)) {
      params.delete(key);
    }
  });

  // Update query parameters based on the provided key-value pairs
  Object.keys(updateParams).forEach(key => {
    const value = updateParams[key];
    if (Array.isArray(value)) {
      // If the value is an array, join it into a comma-separated string
      params.set(key, value.join(','));
    } else {
      // Otherwise, set the value directly
      params.set(key, value);
    }
  });

  // Set the search params back to the URL object
  url.search = params.toString();

  return url.toString();
}