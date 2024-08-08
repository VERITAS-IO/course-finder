"use strict";

import axios from "axios";
import { updateUrlQueryParams } from "../utils.js";
import YoutubeResponse from "../models/response/YoutubeResponse.js";
import YoutubeApiResponseDto from "../models/dtos/YoutubeApiResponseDto.js";

class YoutubeApiClient {
  /**
   * Fetches a list of videos from YouTube API.
   * @param {string} baseUrl - The base URL for the YouTube API request.
   * @returns {Promise<YoutubeResponse[]|null>} A promise that resolves to an array of YoutubeResponse objects or null.
   * @throws {Error} If there's an error fetching the video list.
   */
  async getVideoList(baseUrl) {
    try {
      const initialResponse = await this.fetchInitialVideoList(baseUrl);
      const videoIds = this.extractVideoIds(initialResponse);

      if (!videoIds) {
        return null;
      }

      const detailedVideoUrl = this.constructDetailedVideoUrl(
        baseUrl,
        videoIds
      );
      const detailedResponse = await this.fetchDetailedVideoList(
        detailedVideoUrl
      );

      return this.processVideoResponse(detailedResponse);
    } catch (error) {
      this.handleError(error);
    }
  }
  /**
   * Fetches the initial list of videos.
   * @param {string} url - The URL for the initial API request.
   * @returns {Promise<Object>} The response data from the API.
   */
  async fetchInitialVideoList(url) {
    const response = await axios.get(url);
    return response.data;
  }

  /**
   * Extracts video IDs from the initial API response.
   * @param {Object} responseData - The data from the initial API response.
   * @returns {string|null} A comma-separated string of video IDs, or null if no valid IDs found.
   */
  extractVideoIds(responseData) {
    const videoIds = responseData.items
      .filter((item) => item.id.videoId)
      .map((item) => item.id.videoId)
      .join(",");

    return videoIds || null;
  }

  /**
   * Constructs the URL for fetching detailed video information.
   * @param {string} baseUrl - The original base URL.
   * @param {string} videoIds - Comma-separated video IDs.
   * @returns {URL} The constructed URL for detailed video information.
   */
  constructDetailedVideoUrl(baseUrl, videoIds) {
    let newUrl = new URL(baseUrl);
    newUrl.pathname = new URL("videos", newUrl).pathname;
    return updateUrlQueryParams(newUrl, {
      removeKeys: ["q"],
      updateParams: {
        part: "snippet,contentDetails,statistics",
        id: videoIds,
      },
    });
  }

  /**
   * Fetches detailed information for the videos.
   * @param {URL} url - The URL for fetching detailed video information.
   * @returns {Promise<Object>} The response data from the API.
   */
  async fetchDetailedVideoList(url) {
    const response = await axios.get(url.toString());
    return response.data;
  }

  /**
   * Processes the detailed video response into YoutubeResponse objects.
   * @param {Object} responseData - The data from the detailed video API response.
   * @returns {YoutubeResponse[]} An array of YoutubeResponse objects.
   */
  processVideoResponse(responseData) {
    return responseData.items.map((item) => {
      const mappedValues = new YoutubeApiResponseDto().toDto(item);
      return new YoutubeResponse().toObject(mappedValues);
    });
  }

  /**
   * Handles and logs errors from the API requests.
   * @param {Error} error - The error object.
   * @throws {Error} Rethrows the error after logging.
   */
  handleError = (error) => {
    console.error(
      "Error fetching video list from Youtube:",
      error.response?.data || error.message
    );
    throw error;
  };
}

export default new YoutubeApiClient();
