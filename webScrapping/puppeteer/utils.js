/**
 * Improves the performance of the browser page by setting the user agent,
 * enabling request interception, and blocking unnecessary resources.
 * @param {import('puppeteer').Page} page - The Puppeteer page instance.
 * @returns {Promise<void>}
 */
export const improvePerformance = async (page) => {
  await page.setUserAgent(
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36"
  );
  // Enable request interception
  await page.setRequestInterception(true);
  // Listen for the request event to block unnecessary resources
  page.on("request", (request) => {
    const resourceType = request.resourceType();
    if (
      resourceType === "stylesheet" ||
      resourceType === "font" ||
      resourceType === "media"
    ) {
      return request.abort();
    }
    request.continue();
  });
};
