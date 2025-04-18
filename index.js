// EDIT THIS FILE TO COMPLETE ASSIGNMENT QUESTION 1
const { chromium } = require("playwright");

async function sortHackerNewsArticles() {
	// launch browser
	const browser = await chromium.launch({ headless: false });
	const context = await browser.newContext();
	const page = await context.newPage();
	// go to Hacker News
	await page.goto('https://news.ycombinator.com/newest');
  // store data in hashmap id => { timestamp, title, url }
  const moreLinkLocator = page.locator('a.morelink');
  let first100Articles = [];
  while (first100Articles.length < 100) {
      // Locate all 'span.age' elements currently visible on the page
      const titleLocator = await page.locator('.athing').all();
      const ageSpans = await page.locator('span.age').all();

      if (titleLocator.length !== ageSpans.length) {
        console.error('titleLocator and ageSpans length mismatch');
        break;
      }

      for (let i = 0; i < titleLocator.length; i++) {
        // console.log(titleLocator[i]);
        const id = await titleLocator[i].getAttribute('id');

        // Directly locate the link within the specific td and span
        const linkLocator = titleLocator[i].locator('td.title span.titleline > a');

        // Extract the text content of the link
        const title = await linkLocator.textContent();

        // Extract the href attribute (the URL)
        const url = await linkLocator.getAttribute('href');

        const timestamp = await ageSpans[i].getAttribute('title');
        const articleObject = { id, title, timestamp, url };

        if (first100Articles.length > 0) { 
          const lastArticle = first100Articles[first100Articles.length - 1];
          const lastArticleTimestamp = lastArticle.timestamp.split(' ')[1];
          const currentArticleTimestamp = articleObject.timestamp.split(' ')[1];
          // console.log(lastArticleTimestamp, currentArticleTimestamp);
          if (currentArticleTimestamp > lastArticleTimestamp) {
            console.error(`Timestamp mismatch for articles ${title} and ${lastArticle.title}`);
            return { passed: false, error: `Timestamp mismatch for articles ${title} and ${lastArticle.title}`, articles: first100Articles };
          }
        }
  
        first100Articles.push(articleObject);

        if (first100Articles.length === 100) {
          break;
        }
      }
      // Click the "More" link to load more articles
      await moreLinkLocator.click();
      // Add a small delay or wait for network idle to ensure content loads
      await page.waitForLoadState('networkidle');
  }
  
  // Close the browser
  // await browser.close();

  for (let article of first100Articles) {
    console.log(JSON.stringify(article) + '\n');
  }
  console.log('--------------------------------');
  console.log('Total number of articles: ' + first100Articles.length); 
  console.log('The first 100 articles are sorted');
  return { passed: true, articles: first100Articles, error: null };
}

(async () => {
  await sortHackerNewsArticles();
})();
