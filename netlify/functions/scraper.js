const axios = require('axios');
const cheerio = require('cheerio');

exports.handler = async (event) => {
  try {
    const year = event.queryStringParameters?.year || '2017';
    const url = `https://govdoc.lk/page/gce-advanced-level-exam-${year}-past-papers-sinhala`;
    console.log(`Fetching URL for year ${year}: ${url}`); // Log the URL being fetched

    // Fetch the HTML content live with a timeout
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      },
      timeout: 5000 // 5-second timeout to prevent hanging
    });

    if (response.status !== 200) {
      console.log(`Failed to fetch page for year ${year}: Status ${response.status}`);
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

    console.log(`Found ${papers.length} papers for year ${year}`); // Log the number of papers

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
    console.error(`Error in scraper for year ${event.queryStringParameters?.year || 'unknown'}: ${error.message}`);
    if (error.response && error.response.status) {
      return {
        statusCode: error.response.status,
        body: JSON.stringify({
          creator: 'Chathura Hansaka',
          year: parseInt(event.queryStringParameters?.year) || 'unknown',
          success: false,
          papers: [],
          message: `Failed to fetch page for year ${event.queryStringParameters?.year}: Status ${error.response.status}`
        })
      };
    }
    return {
      statusCode: 500,
      body: JSON.stringify({
        creator: 'Chathura Hansaka',
        year: parseInt(event.queryStringParameters?.year) || 'unknown',
        success: false,
        papers: [],
        message: `Error in scraper: ${error.message}`
      })
    };
  }
};
