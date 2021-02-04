const functions = require('firebase-functions');
const admin = require('firebase-admin');
const lighthouse = require('lighthouse');
const chromeLauncher = require('chrome-launcher');
const moment = require('moment');

admin.initializeApp();

const getAvg = (arr) => arr.reduce((a, b) => a + b, 0) / arr.length;

exports.insight = functions.https.onRequest(async (request, respoonse) => {
  const { url, iterations } = request.query || {};
  const scores = [];

  const chrome = await chromeLauncher.launch({chromeFlags: ['--headless']});
  
  const options = {
    logLevel: 'info',
    output: 'json',
    onlyCategories: ['performance'],
    port: chrome.port
  };

  for (i of Array.from({length: iterations || 3})) {
      const { lhr }  = await lighthouse(url, options);
      const { score } = lhr.categories.performance;
      scores.push(score * 100);
  }

  await chrome.kill();

  const average = getAvg(scores);

  const entry = {
      url,
      average,
      date: moment().format('YYYY-MM-DD hh:mm:ss')
  }
  await admin.firestore().collection('insigths').add(entry);

  const { docs } = await admin.firestore().collection('insigths').get()
  const allEntries = docs.map(doc => doc.data());

  respoonse.json(allEntries);
});
