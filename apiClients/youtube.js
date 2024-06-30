"use strict";

import axios from "axios";
import { updateUrlQueryParams } from "../utils.js";
import YoutubeResponse from "../models/response/YoutubeResponse.js";
import YoutubeApiResponseDto from "../models/dtos/YoutubeApiResponseDto.js";
class YoutubeApiClient {
  constructor() {}

  async getVideoList(baseUrl) {
    try {
      // Create the Udemy search baseUrl
      // Make the GET request to Udemy API
      const response = await axios.get(baseUrl);
      // Return the list of videos

      const videoIds = response.data.items.map((item) => item?.id?.videoId).join(',');
      const newPath = "videos";

      let newUrl = new URL(baseUrl);
      newUrl.pathname = new URL(newPath, newUrl).pathname; // updated to use newUrl
      newUrl = updateUrlQueryParams(newUrl, {
        removeKeys: ["q"],
        updateParams: {
          part: "snippet, contentDetails, statistics",
          id:videoIds
        },
      });
      const secondResponse = await axios.get(newUrl.toString()); // updated to use newUrl
      const results = secondResponse?.data?.items?.map((item) => {
        const mappedValues = new YoutubeApiResponseDto().toDto(item);
        const result = new YoutubeResponse().toObject(mappedValues);
        return result;
      })
      return results;
    } catch (error) {
      console.error(
        "Error fetching video list from Youtube:",
        error.response?.data || error.message
      );
      throw error;
    }
  }
}

export default new YoutubeApiClient();
