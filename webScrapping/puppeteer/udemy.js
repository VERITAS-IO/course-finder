import puppeteer from "puppeteer";
import { getCustomConfig } from "../../config.js";
import { improvePerformance } from "./utils.js";

async function getUdemyCourses(searchUrl) {
  console.log("Udemy Scrapping Started");
  const udemyScrappingStarted  = performance.now();

  const browser = await puppeteer.launch(getCustomConfig(true));
  const page = await browser.newPage();
  await improvePerformance(page);

  // Navigate to Udemy search
  await page.goto(searchUrl, { waitUntil: "networkidle2", timeout: 15000 }); // Increased timeout to 2 minutes

  // Wait for the search results container to load
  const a = await page.waitForSelector(".course-list--container--HY2ry", {
    timeout: 15000,
  }); // Increased timeout to 2 minutes
  const b = await page.waitForSelector(".popper-module--popper--mM5Ie", {
    timeout: 15000,
  }); // Increased timeout to 2 minutes
  const c = await page.waitForSelector(
    ".course-card-module--main-content--pEiUr",
    { timeout: 15000 }
  );

  // Extract the search results
  const results = await page.evaluate(() => {
    const courseElements = Array.from(
      document.querySelectorAll(".course-card-module--main-content--pEiUr")
    );
    return courseElements.map((courseElement) => {
      const titleElement = courseElement.querySelector(
        ".course-card-title-module--course-title--wmFXN"
      );
      const authorElement = courseElement.querySelector(
        ".course-card-instructors-module--instructor-list--cJTfw"
      );
      const ratingElement = courseElement.querySelector(
        ".star-rating-module--rating-number--2-qA2"
      );
      const reviewsElement = courseElement.querySelector(
        ".course-card-ratings-module--reviews-text--1z0l4"
      );
      const durationElement = courseElement.querySelector(
        ".course-card-details-module--row--jw-lD:nth-child(1)"
      );
      const numLecturesElement = courseElement.querySelector(
        ".course-card-details-module--row--jw-lD:nth-child(2)"
      );
      const levelElement = courseElement.querySelector(
        ".course-card-details-module--row--jw-lD:nth-child(3)"
      );
      const priceElement = courseElement.querySelector(
        ".course-card-module--price-text-base-price-text-component-discount-price--Xztnd"
      );
      const badgesElement = courseElement.querySelector(
        ".course-badges-module--course-badges--NtSTO"
      );

      const firstLink = titleElement.querySelector('a') ?? null;
      return {
        link: `${firstLink.href}`,
        title: titleElement.textContent.trim(),
        author: authorElement ? authorElement.textContent.trim() : "",
        rating: ratingElement
          ? parseFloat(ratingElement.textContent.trim())
          : 0,
        reviews: reviewsElement
          ? parseInt(
              reviewsElement.textContent.replace(/[()]/g, "").replace(/,/g, "")
            )
          : 0,
        duration: durationElement ? durationElement.textContent.trim() : "",
        numLectures: numLecturesElement
          ? numLecturesElement.textContent.trim()
          : "",
        level: levelElement ? levelElement.textContent.trim() : "",
        price: priceElement ? priceElement.textContent.trim() : "",
        badges: badgesElement
          ? Array.from(badgesElement.querySelectorAll(".ud-badge")).map(
              (badge) => badge.textContent.trim()
            )
          : [],
      };
    });
  });

  await browser.close();
  console.log("udemy Scrapping Finished");
  const udemyScrappingDone  = performance.now();
  console.log("udemy Scrapping Latency:", udemyScrappingDone-udemyScrappingStarted)
  console.log("**********************************************************");
  return { time: new Date().toUTCString(), results };
}

export { getUdemyCourses };
