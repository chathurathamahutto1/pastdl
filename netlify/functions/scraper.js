const cheerio = require('cheerio');

// Hardcoded HTML content (replace with the provided HTML)
const html = `<!-- Paste the provided HTML content here -->`;

exports.handler = async (event) => {
  try {
    const year = event.queryStringParameters?.year || '2017';
    if (year !== '2017') {
      return {
        statusCode: 400,
        body: JSON.stringify({
          creator: 'Chathura Hansak',
          year,
          success: false,
          papers: [],
          message: 'Only 2017 papers are available'
        })
      };
    }

    const $ = cheerio.load(html);
    const papers = [];

    $('.col-12.ps-sm-3.ps-4.pr-4').each((i, element) => {
      const subject = $(element).find('.col-md-8.col-8.text-start.ml-2').text().trim();
      const downloadLink = $(element).find('a').attr('href');
      if (subject && downloadLink) {
        papers.push({ subject, downloadLink });
      }
    });

    return {
      statusCode: 200,
      body: JSON.stringify({
        creator: 'Chathura Hansak',
        year: parseInt(year),
        success: true,
        papers
      })
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        creator: 'Chathura Hansak',
        year,
        success: false,
        papers: [],
        message: error.message
      })
    };
  }
};
