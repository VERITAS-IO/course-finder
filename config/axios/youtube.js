import { createAuth } from "../../utils.js";
import resourceConstants from "../../constants/ResourceConstants.js";
import dotenv from "dotenv";

dotenv.config();


/**
 * Builds the query parameters for a YouTube search request.
 *
 * @param {string} searchQuery - The search query string.
 * @returns {object} The query parameters for the YouTube API request.
 */

export const buildYoutubeParams = (searchQuery) => {
  const params = {
    part: "snippet",
    q: searchQuery,
    key: process.env.YOUTUBE_API_KEY, // Ensure this is correctly set in your environment variables
    maxResults: 5, // Adjust the number of results as needed
  };
  return params;
};
