const cheerio = require('cheerio');

// Insert the full HTML content here (shortened for brevity; replace with the full HTML)
const html = `
<div class="col-12 ps-sm-3 ps-4 pr-4">
  <div class="row mb-1 align-items-center bottom-border-set">
    <div class="col-md-8 col-8 text-start ml-2">Accounting</div>
    <div class="col-md-4 col-4 text-end">
      <a href="https://govdoc.lk/view?id=1650&fid=61c2c4ff41828" target="_blank">
        <span class="button d-flex align-items-center">
          <i class="bi bi-download" style="font-size:16px; margin-right:8px;"></i> Download
        </span>
      </a>
    </div>
  </div>
</div>
<!-- Add the rest of the HTML content here -->
`;

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

    if (papers.length === 0) {
      return {
        statusCode: 500,
        body: JSON.stringify({
          creator: 'Chathura Hansak',
          year: parseInt(year),
          success: false,
          papers: [],
          message: 'No papers found in the HTML content'
        })
      };
    }

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
        message: `Error in scraper: ${error.message}`
      })
    };
  }
};
