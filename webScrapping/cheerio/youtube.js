import puppeteer from 'puppeteer';
import cheerio from 'cheerio';
import { getCustomConfig, restrictionConfig } from "../../config.js";
import { improvePerformance } from "../puppeteer/utils.js";

/**
 * Retrieves the top YouTube video links and titles for a given search URL.
 * @param {string} searchUrl - The URL for the YouTube search.
 * @returns {Promise<{ time: string, results: Object[] }>} A Promise that resolves with an object containing the current time and an array of video results.
 */
export async function getTopYouTubeLinksAndTitles(searchUrl) {
  console.log("YouTube Scraping Started");
  const youtubeScrapingStarted = performance.now();

  try {
    // Launch Puppeteer
    const browser = await puppeteer.launch(getCustomConfig(true));
    const page = await browser.newPage();
    await improvePerformance(page);

    // Navigate to YouTube search URL
    await page.goto(searchUrl, { waitUntil: 'networkidle0' });

    // Wait for the search results to load
    await page.waitForSelector('ytd-video-renderer');

    // Get the rendered HTML content
    const html = await page.content();

    // Close Puppeteer
    await browser.close();

    // Load the HTML into Cheerio
    const $ = cheerio.load(html);

    // Select and extract video details
    const results = [];
    $('ytd-video-renderer').each((index, element) => {
      const videoTitleElement = $(element).find('#video-title');
      const videoDescriptionElement = $(element).find('#description-text');
      const channelTitleElement = $(element).find('#byline a');
      const metadataElements = $(element).find('#metadata-line span');

      const videoLink = videoTitleElement.attr('href') ? `https://www.youtube.com${videoTitleElement.attr('href')}` : '';
      const channelLink = channelTitleElement.attr('href') ? `https://www.youtube.com${channelTitleElement.attr('href')}` : '';

      results.push({
        link: videoLink,
        title: videoTitleElement.text().trim(),
        snippet: videoDescriptionElement.length ? videoDescriptionElement.text().trim() : '',
        channel: channelTitleElement.length ? channelTitleElement.text().trim() : '',
        channel_link: channelLink,
        num_views: metadataElements.eq(0).text().trim(),
        release_date: metadataElements.eq(1).text().trim(),
      });
    });

    console.log("YouTube Scraping Finished");
    const youtubeScrapingDone = performance.now();
    console.log("YouTube Scraping Latency:", youtubeScrapingDone - youtubeScrapingStarted);
    console.log("**********************************************************");
    return { time: new Date().toUTCString(), results };

  } catch (error) {
    console.error('Error occurred while scraping YouTube:', error);
    return { time: new Date().toUTCString(), results: [] };
  }
}