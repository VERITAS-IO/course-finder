import { getUdemyCourses } from "../webScrapping/udemy.js";

async function main(url) {
  const result = await getUdemyCourses(url);
  console.log(`result:`, result);
}

main("https://www.udemy.com/courses/search/?src=ukw&q=blockchain+beginner");
