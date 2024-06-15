import puppeteer from "puppeteer";
import { getCustomConfig, restrictionConfig } from "../../config.js";
import { improvePerformance } from "./utils.js";
/**
 * Retrieves the top YouTube video links and titles for a given search URL.
 * @param {string} searchUrl - The URL for the YouTube search.
 * @returns {Promise<{ time: string, results: Object[] }>} A Promise that resolves with an object containing the current time and an array of video results.
 */
export async function getTopYouTubeLinksAndTitles(searchUrl) {
  console.log("Youtube Scrapping Started");
  const youtubeScrappingStarted  = performance.now();
  const browser = await puppeteer.launch(getCustomConfig(true));
  const page = await browser.newPage();
  await improvePerformance(page);

  // Navigate to YouTube search
  await page.goto(searchUrl, { waitUntil: "networkidle0" });

  // Wait for the search results to load
  await page.waitForSelector("ytd-video-renderer");

  // Extract the search results
  const results = await page.evaluate(() => {
    const videoElements = Array.from(
      document.querySelectorAll("ytd-video-renderer")
    );
    return videoElements.map((videoElement) => {
      const videoTitleElement = videoElement.querySelector("#video-title");
      const videoDescriptionElement =
        videoElement.querySelector("#description-text");
      const channelTitleElement = videoElement.querySelector("#byline a");
      const metadataElements = Array.from(
        videoElement.querySelectorAll("#metadata-line span")
      );
      return {
        link: `https://www.youtube.com${videoTitleElement.getAttribute("href")}`,
        title: videoTitleElement.textContent.trim(),
        snippet: videoDescriptionElement
          ? videoDescriptionElement.textContent.trim()
          : "",
        channel: channelTitleElement
          ? channelTitleElement.textContent.trim()
          : "",
        channel_link: channelTitleElement
          ? `https://www.youtube.com${channelTitleElement.getAttribute("href")}`
          : "",
        num_views: metadataElements[0]
          ? metadataElements[0].textContent.trim()
          : "",
        release_date: metadataElements[1]
          ? metadataElements[1].textContent.trim()
          : "",
      };
    });
  });
  await browser.close();
  console.log("Youtube Scrapping Finished");
  const youtubeScrappingDone  = performance.now();
  console.log("Youtube Scrapping Latency:", youtubeScrappingDone-youtubeScrappingStarted)
  console.log("**********************************************************");
  return { time: new Date().toUTCString(), results };
}