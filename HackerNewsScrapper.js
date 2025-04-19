class HackerNewsScrapper {
  constructor(chromium, url) {
    this.chromium = chromium;
    this.browser = null;
    this.context = null;
    this.page = null;
    this.url = url;
  }

  async _init() {
    this.browser = await this.chromium.launch({ headless: false });
    this.context = await this.browser.newContext();
    this.page = await this.context.newPage();
  }

  static async create(chromium, url) {
    const instance = new HackerNewsScrapper(chromium, url);
    await instance._init();
    return instance;
  }

  async scrape(targets, limit, close = true) {
    const result = new Map();
    for (let target of targets) {
      result.set(target, []);
    }

    await this.page.goto(this.url);
    const moreLinkLocator = this.page.locator('a.morelink');
    let count = 0;
    while (count < limit) {
      for (let target of targets) {
        const targetLocator = await this.page.locator(target).all();
        result.get(target).push(...targetLocator);
      }
      await moreLinkLocator.click();
      await this.page.waitForLoadState('networkidle');
      count = result.get(targets[0])?.length || 0;
    }

    for (let [target, data] of result) {
      if (data.length > limit) {
        data.splice(limit, data.length - limit);
        result.set(target, data);
      }
    }
    if (close) {
      await this.close();
    }
    return result;
  }

  async validateFirst100Articles() {
    const result = await this.scrape(['.athing', 'span.age'], 100, false);
    const first100ArticlesTd = result.get('.athing');
    const ageSpans = result.get('span.age');
    const first100ArticlesObject = [];
    for (let i = 0; i < 100; i++) {
			const id = await first100ArticlesTd[i].getAttribute('id');
			const linkLocator = first100ArticlesTd[i].locator(
				'td.title span.titleline > a',
			);
			const title = await linkLocator.textContent();
			const url = await linkLocator.getAttribute('href');
			const timestamp = await ageSpans[i].getAttribute('title');
			const articleObject = { id, title, timestamp, url };
			const currentArticleTimestamp = parseInt(articleObject.timestamp, 10);

			if (i > 0) {
				const previousArticleObject = first100ArticlesObject[i - 1];
				const previousArticleTimestamp = parseInt(
					previousArticleObject.timestamp,
					10,
				);

				if (currentArticleTimestamp > previousArticleTimestamp) {
					return {
						passed: false,
						error: `Timestamp mismatch for articles ${title} and ${previousArticleObject.title}`,
						articles: [],
					};
				}
			}

			first100ArticlesObject.push(articleObject);
		}
    return { passed: true, error: null, articles: first100ArticlesObject };
  }

  async close() {
    await this.browser.close();
  }
}

module.exports = HackerNewsScrapper;
