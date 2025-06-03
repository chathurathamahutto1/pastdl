const cheerio = require('cheerio');
const fs = require('fs');

function scrapePastPapers(html, year) {
  try {
    const $ = cheerio.load(html);
    const papers = [];

    // Select all rows containing past paper data
    $('div.col-12.ps-sm-3.ps-4.pr-4').each((index, element) => {
      const subject = $(element).find('div.col-md-8.col-8.text-start.ml-2').text().trim();
      const url = $(element).find('a').attr('href');
      if (subject && url) {
        papers.push({ subject, url });
      }
    });

    // Create JSON output
    const output = {
      year: year,
      creator: 'Chathura Hansaka',
      success: papers.length > 0,
      papers: papers
    };

    return output;
  } catch (error) {
    console.error('Scraping error:', error);
    return {
      year: year,
      creator: 'Chathura Hansaka',
      success: false,
      papers: []
    };
  }
}

module.exports = { scrapePastPapers };
