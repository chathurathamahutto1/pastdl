const express = require('express');
const { scrapePastPapers } = require('./scraper');
const fs = require('fs');
const path = require('path');

const app = express();

// Read the HTML file (in a real scenario, this could be fetched via an HTTP request)
const html = fs.readFileSync(path.join(__dirname, '../public/past-papers.html'), 'utf-8');

app.get('/q=:year', (req, res) => {
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

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
