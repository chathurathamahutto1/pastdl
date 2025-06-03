const axios = require('axios');
const cheerio = require('cheerio');

exports.handler = async (event) => {
  try {
    const year = event.queryStringParameters?.year || '2017';
    const url = `https://govdoc.lk/page/gce-advanced-level-exam-${year}-past-papers-sinhala`;

    // Fetch the HTML content live
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    if (response.status !== 200) {
      return {
        statusCode: response.status,
        body: JSON.stringify({
          creator: 'Chathura Hansaka',
          year: parseInt(year),
          success: false,
          papers: [],
          message: `Failed to fetch page for year ${year}: Status ${response.status}`
        })
      };
    }

    const $ = cheerio.load(response.data);
    const papers = [];

    // Extract papers from the HTML
    $('.col-12.ps-sm-3.ps-4.pr-4').each((i, element) => {
      const subject = $(element).find('.col-md-8.col-8.text-start.ml-2').text().trim();
      const downloadLink = $(element).find('a').attr('href');
      if (subject && downloadLink) {
        papers.push({ subject, downloadLink });
      }
    });

    if (papers.length === 0) {
      return {
        statusCode: 200,
        body: JSON.stringify({
          creator: 'Chathura Hansaka',
          year: parseInt(year),
          success: false,
          papers: [],
          message: `No papers found for year ${year}`
        })
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        creator: 'Chathura Hansaka',
        year: parseInt(year),
        success: true,
        papers
      })
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        creator: 'Chathura Hansaka',
        year: event.queryStringParameters?.year || 'unknown',
        success: false,
        papers: [],
        message: `Error in scraper: ${error.message}`
      })
    };
  }
};
