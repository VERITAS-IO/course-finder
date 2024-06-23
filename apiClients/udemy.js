import axios from "axios";
import { createUrl } from "../utils.js"; // Adjust the path to utils.js as per your project structure
import resourceConstants from "../constants/ResourceConstants.js";
import { headers } from "../config/axios/udemy.js";

class UdemyApiClient {
  constructor() {}
  async getVideoList(url) {
    try {
      // Create the Udemy search URL
      // Make the GET request to Udemy API
      const response = await axios.get(url, {headers});
      // Return the list of videos
      return response.data;
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
