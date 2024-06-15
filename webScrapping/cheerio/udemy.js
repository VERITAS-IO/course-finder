import axios from 'axios';
import cheerio from 'cheerio';

async function getUdemyCourses(searchUrl) {
  console.log("Udemy Scraping Started");
  const udemyScrapingStarted = performance.now();

  try {
    // Fetch the HTML content of the search page
    const { data: html } = await axios.get(searchUrl, { timeout: 15000 });

    // Load the HTML into Cheerio
    const $ = cheerio.load(html);

    // Select and extract course details
    const results = [];
    $('.course-card-module--main-content--pEiUr').each((index, element) => {
      const titleElement = $(element).find('.course-card-title-module--course-title--wmFXN');
      const authorElement = $(element).find('.course-card-instructors-module--instructor-list--cJTfw');
      const ratingElement = $(element).find('.star-rating-module--rating-number--2-qA2');
      const reviewsElement = $(element).find('.course-card-ratings-module--reviews-text--1z0l4');
      const durationElement = $(element).find('.course-card-details-module--row--jw-lD:nth-child(1)');
      const numLecturesElement = $(element).find('.course-card-details-module--row--jw-lD:nth-child(2)');
      const levelElement = $(element).find('.course-card-details-module--row--jw-lD:nth-child(3)');
      const priceElement = $(element).find('.course-card-module--price-text-base-price-text-component-discount-price--Xztnd');
      const badgesElement = $(element).find('.course-badges-module--course-badges--NtSTO');

      const firstLink = titleElement.find('a').attr('href') ?? null;

      results.push({
        link: firstLink,
        title: titleElement.text().trim(),
        author: authorElement.text().trim(),
        rating: ratingElement.length ? parseFloat(ratingElement.text().trim()) : 0,
        reviews: reviewsElement.length ? parseInt(reviewsElement.text().replace(/[()]/g, "").replace(/,/g, "")) : 0,
        duration: durationElement.text().trim(),
        numLectures: numLecturesElement.text().trim(),
        level: levelElement.text().trim(),
        price: priceElement.text().trim(),
        badges: badgesElement.length ? badgesElement.find('.ud-badge').map((i, el) => $(el).text().trim()).get() : [],
      });
    });

    console.log("Udemy Scraping Finished");
    const udemyScrapingDone = performance.now();
    console.log("Udemy Scraping Latency:", udemyScrapingDone - udemyScrapingStarted);
    console.log("**********************************************************");
    return { time: new Date().toUTCString(), results };

  } catch (error) {
    console.error('Error occurred while scraping Udemy:', error);
    return { time: new Date().toUTCString(), results: [] };
  }
}

export { getUdemyCourses };
