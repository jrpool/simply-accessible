const webdriver = require('selenium-webdriver');
const {Builder, By} = webdriver;
const chrome = require('selenium-webdriver/chrome');
const wmap = webdriver.promise.map;
const startTime = new Date();
const limit = 200;
const reportInterval = 25;
let iterations = 0;
const urls = new Set(['https://start.path']);
const linkCounts = [];
const linkSampleSize = 20;
const pageLangs = {};
const roleCounts = [];
const elementRoles = {};
const tableCounts = [];
const realTableSizes = [];
const fakeTableSizes = [];
const realTableThFractions = [];
const fakeTableThFractions = [];
const visiteds = [];
let loopError = false;
const crawler = async () => {
  const driver = await new Builder()
  .forBrowser('chrome')
  .setChromeOptions(
    new chrome.Options().headless().windowSize({width: 640, height: 480})
  )
  .build();
  try {
    while(urls.size && iterations < limit) {
      iterations++;
      const url = urls.values().next().value;
      urls.delete(url);
      visiteds.push(url);
      try {
        console.log(`${iterations}: ${url}`);
        await driver.sleep(loopError ? 8000 : 0);
        loopError = false;
        await driver.navigate().to(url);
        // URL harvesting.
        if (urls.size < 1.5 * (limit - iterations)) {
          console.log(`Queued URL count: ${urls.size}`);
          await driver.findElements(By.css('a[href]')).then(async links => {
            const linkCount = links.length;
            console.log(`${linkCount} links found`);
            linkCounts.push(linkCount);
            const sampleFraction = Math.max(
              1, Math.round(linkCount / linkSampleSize)
            );
            const sample = links.filter(
              (link, index) => index % sampleFraction === 0
            );
            await wmap(sample, link => {
              link.getAttribute('href').then(href => {
                if (
                  href.includes('vanguard') && ! href.startsWith('mailto:')
                ) {
                  urls.add(href);
                }
              });
            });
          });
        }
        // Page language declaration.
        await driver
        .findElement(By.tagName('html'))
        .getAttribute('lang')
        .then(lang => {
          if (pageLangs[lang]) {
            pageLangs[lang]++;
          }
          else {
            pageLangs[lang] = 1;
          }
        });
        // Role assignment. The wmap function produces EADDRINUSE errors.
        await driver.findElements(By.css('[role]')).then(async roleEls => {
          console.log(`${roleEls.length} roles found`);
          roleCounts.push(roleEls.length);
          await wmap(roleEls, async roleEl => {
            const elType = await roleEl.getTagName();
            const elRole = await roleEl.getAttribute('role');
            if (elementRoles[elType]) {
              if (elementRoles[elType][elRole]) {
                elementRoles[elType][elRole]++;
              }
              else {
                elementRoles[elType][elRole] = 1;
              }
            }
            else {
              elementRoles[elType] = {};
              elementRoles[elType][elRole] = 1;
            }
          });
        });
        // Tables.
        await driver.findElements(By.tagName('table')).then(async tables => {
          console.log(`${tables.length} tables found`);
          tableCounts.push(tables.length);
          await wmap(tables, async table => {
            const isReal = await table
            .getAttribute('role')
            .then(role => role !== 'presentation');
            const thCount = await table
            .findElements(By.tagName('th'))
            .then(ths => ths.length);
            const tdCount = await table
            .findElements(By.tagName('td'))
            .then(tds => tds.length);
            const size = thCount + tdCount;
            const thFraction = Math.round(100 * thCount / size);
            if (isReal) {
              realTableSizes.push(size);
              realTableThFractions.push(thFraction);
            }
            else {
              fakeTableSizes.push(size);
              fakeTableThFractions.push(thFraction);
            }
          });
        });
        if (iterations === limit || iterations % reportInterval === 0) {
          console.log(`${iterations} URLs have been checked:`);
          console.log(JSON.stringify(visiteds, null, 2));
          console.log(`${urls.size} URLs queued but not checked`);
          console.log(`Link count tally:\n${JSON.stringify(linkCounts)}`);
          console.log(`Page languages:\n${JSON.stringify(pageLangs, null, 2)}`);
          console.log('Element roles:');
          console.log(`Role count tally: ${JSON.stringify(roleCounts)}`);
          console.log(JSON.stringify(elementRoles, null, 2));
        }
      }
      catch (error) {
        console.log(`A while-loop error occurred: ${error.message}`);
        loopError = true;
      }
    }
  }
  catch (error) {
    console.log(`A fatal error occurred: ${error.message}`);
    try {
      await driver.quit();
    }
    catch(error) {
      console.log(`Failed to make the driver quit: ${error.message}`);
    }
  }
  finally {
    console.log('Crawl complete');
    const endTime = new Date();
    const elapsedMinutes = Math.round((endTime - startTime) / 60000);
    const iterationsPerMinute = Math.round(iterations / elapsedMinutes);
    console.log(`Elapsed time ${elapsedMinutes} minutes`);
    console.log(`${iterationsPerMinute} visits per minute`);
  }
};
crawler();
