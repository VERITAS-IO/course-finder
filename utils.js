//utils.js

import { resourceConstants, rootUrls } from "./constants/index.js"; // Ensure you have the correct path to your constants file

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
      return `results?search_query=${queryString}`;
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
 * Creates a full URL for a resource search based on the given keywords.
 * @param {string[]} keywords - An array of keywords to be used in the search.
 * @param {string} resourceFlag - The flag indicating which resource platform to use.
 * @returns {string} The complete URL for the resource search.
 */
export const createUrl = (keywords, resourceFlag) => {
  validateParams(keywords, resourceFlag);

  switch (resourceFlag) {
    case resourceConstants.YOUTUBE:
      return `${rootUrls.YOUTUBE}/${createQuery(
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
