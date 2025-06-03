const express = require('express');
const serverless = require('serverless-http');
const { scrapePastPapers } = require('../../src/scraper');
const fs = require('fs');
const path = require('path');

const app = express();
const router = express.Router();

// Read the HTML file
const html = fs.readFileSync(path.join(__dirname, '../../public/past-papers.html'), 'utf-8');

router.get('/q=:year', (req, res) => {
  const year = req.params.year;
  if (year === '2017') {
    const result = scrapePastPapers(html, year);
    res.json(result);
  } else {
    res.json({
      year: year,
      creator: 'Chathura Hansaka',
      success: false,
      papers: []
    });
  }
});

// Serve static files
app.use(express.static('public'));
app.use('/.netlify/functions/server', router);

module.exports.handler = serverless(app);
