import axios from "axios";
import dotenv from "dotenv";
import { createUrl } from "../utils.js"; // Adjust the path to utils.js as per your project structure
import resourceConstants from "../constants/ResourceConstants.js";

dotenv.config();

class UdemyApiClient {
  constructor() {
    this.clientId = process.env.UDEMY_CLIENT_IDENTITY;
    this.clientSecret = process.env.UDEMY_CLIENT_KEY;
    this.authHeader = `Basic ${Buffer.from(
      `${this.clientId}:${this.clientSecret}`
    ).toString("base64")}`;
  }
  async getVideoList(url) {
    try {
      // Create the Udemy search URL
      // Make the GET request to Udemy API
      const response = await axios.get(url, {
        headers: {
          Accept: "application/json, text/plain, */*",
          Authorization: this.authHeader,
          "Content-Type": "application/json",
        },
      });
      // Return the list of videos
      return response.data;
    } catch (error) {
      console.error("Error fetching video list from Udemy:", error);
      throw error;
    }
  }
}

export default new UdemyApiClient();
