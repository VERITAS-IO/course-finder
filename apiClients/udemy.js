"use strict";
import axios from "axios";
import { createUrl } from "../utils.js"; // Adjust the path to utils.js as per your project structure
import resourceConstants from "../constants/ResourceConstants.js";
import { headers } from "../config/axios/udemy.js";
import YoutubeResponse from "../models/response/YoutubeResponse.js";
import UdemyResponse from "../models/response/UdemyResponse.js";
import UdemyApiResponseDto from "../models/dtos/UdemyApiResponseDto.js";

class UdemyApiClient {
  constructor() {}
  async getVideoList(url) {
    try {
      // Create the Udemy search URL
      // Make the GET request to Udemy API
      const response = await axios.get(url, { headers });
      // Return the list of videos
      const results = response.data.results.map((item) => {
        let mappedValues = new UdemyApiResponseDto().toDto(item);
        let result = new UdemyResponse().toObject(mappedValues);
        return result;
      });
      return results;
    } catch (error) {
      console.error(
        "Error fetching video list from Udemy:",
        error.response?.data || error.message
      );
      throw error;
    }
  }
}

export default new UdemyApiClient();
