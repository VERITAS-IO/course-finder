import { getTopYouTubeLinksAndTitles } from "../webScrapping/cheerio/youtube.js";
import { getUdemyCourses } from "../webScrapping/cheerio/udemy.js";
import UdemyClientApi from "../apiClients/udemy.js";

// Placeholder functions for platforms that are not yet implemen

const getCourseraCourses = async () => {
  // Placeholder function for Coursera
  throw new Error("Coursera function is not implemented yet.");
};

const getMediumArticles = async () => {
  // Placeholder function for Medium
  throw new Error("Medium function is not implemented yet.");
};

const getYoutubeCourses = async () => {
    // Placeholder function for Youtube
    throw new Error("Youtube function is not implemented yet.");
  };
  
const functionTable = {
  YOUTUBE: getYoutubeCourses,
  UDEMY: UdemyClientApi.getVideoList,
  COURSERA: getCourseraCourses,
  MEDIUM: getMediumArticles,
};

export default functionTable;
