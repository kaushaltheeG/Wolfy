// EDIT THIS FILE TO COMPLETE ASSIGNMENT QUESTION 1
const { chromium } = require("playwright");
const HackerNewsScrapper = require('./HackerNewsScrapper');

(async () => {
  const scrapper = await HackerNewsScrapper.create(chromium, 'https://news.ycombinator.com/newest');
  const result = await scrapper.validateFirst100Articles();
  if (result.passed) {
    console.log('The first 100 articles are sorted');
    for (let article of result.articles) {
      console.log(article);
			console.log('\n');
		}
		console.log('-------------------------------------------');
		console.log(`Total number of articles: ${result.articles.length}`);
		console.log(`The first ${result.articles.length} articles are sorted`);
		console.log('-------------------------------------------');

  } else {
    console.error(result.error);
  }
  await scrapper.close();
})();
