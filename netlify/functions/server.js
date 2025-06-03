const express = require('express');
const serverless = require('serverless-http');
const { scrapePastPapers } = require('../../src/scraper');
const fs = require('fs');
const path = require('path');

const app = express();
const router = express.Router();

// Read the HTML file from the public directory
const htmlPath = path.resolve(__dirname, '../../public/past-papers.html');
let html;
try {
  html = fs.readFileSync(htmlPath, 'utf-8');
} catch (error) {
  console.error('Error reading past-papers.html:', error);
  html = ''; // Fallback to empty string to avoid crashing
}

router.get('/q=:year', (req, res) => {
  const year = req.params.year;
  if (year === '2017' && html) {
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
app.use(express.static(path.join(__dirname, '../../public')));
app.use('/.netlify/functions/server', router);

module.exports.handler = serverless(app);
