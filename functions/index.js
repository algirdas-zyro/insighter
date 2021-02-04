const functions = require("firebase-functions");
const admin = require("firebase-admin");
const lighthouse = require("lighthouse");
const chromeLauncher = require("chrome-launcher");
const moment = require("moment");
const axios = require("axios");

const API_URL = "https://www.googleapis.com/pagespeedonline/v5/runPagespeed";

admin.initializeApp();

const getAvg = (arr) => arr.reduce((a, b) => a + b, 0) / arr.length;

exports.insight = functions.https.onRequest(async (request, response) => {
  const { url, iterations } = request.query || {};

  const requests = Array.from({ length: iterations || 1 }).map(() =>
    axios.get(`${API_URL}?strategy=mobile&url=${url}&key=${functions.config().insight.key}`)
  );

  const responses = await Promise.all(requests);
  const scores = responses.map(
    ({ data }) => data.lighthouseResult.categories.performance.score
  );

  const entry = {
      url,
      average: getAvg(scores) * 100,
      date: moment().format('YYYY-MM-DD hh:mm:ss')
  }

  await admin.firestore().collection('insigths').add(entry);

  const { docs } = await admin.firestore().collection('insigths').get()
  const allEntries = docs.map(doc => doc.data());

  response.json(allEntries);
});
