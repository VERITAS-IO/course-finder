import axios from "axios";
class YoutubeApiClient {
  constructor() {}
  async getVideoList(url) {
    try {
      // Create the Udemy search URL
      // Make the GET request to Udemy API
      const response = await axios.get(url);
      // Return the list of videos
      return response.data;
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
