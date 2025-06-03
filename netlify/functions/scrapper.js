const { JSDOM } = require('jsdom');

exports.handler = async (event, context) => {
  try {
    console.log('Starting scraper for 2017 A/L past papers...');
    
    // Fetch the 2017 A/L past papers page
    const response = await fetch('https://govdoc.lk/page/gce-advanced-level-exam-2017-past-papers-sinhala');
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const html = await response.text();
    console.log('Successfully fetched HTML content');
    
    // Parse HTML with JSDOM
    const dom = new JSDOM(html);
    const document = dom.window.document;
    
    // Extract past paper links
    const papers = [];
    
    // Look for the pattern in the HTML structure
    const downloadRows = document.querySelectorAll('.row.mb-1.align-items-center.bottom-border-set');
    
    if (downloadRows.length === 0) {
      console.log('No download rows found, trying alternative selectors...');
      
      // Alternative approach: look for all download links
      const downloadLinks = document.querySelectorAll('a[href*="govdoc.lk/view"]');
      
      downloadLinks.forEach((link, index) => {
        const href = link.getAttribute('href');
        const parentText = link.closest('.col-12')?.querySelector('.text-start')?.textContent?.trim();
        
        if (href && parentText) {
          papers.push({
            subject: parentText,
            downloadUrl: href.startsWith('http') ? href : `https://govdoc.lk${href}`,
            id: `paper_${index + 1}`
          });
        }
      });
    } else {
      console.log(`Found ${downloadRows.length} download rows`);
      
      downloadRows.forEach((row, index) => {
        const subjectElement = row.querySelector('.text-start');
        const downloadLink = row.querySelector('a[href*="govdoc.lk/view"]');
        
        if (subjectElement && downloadLink) {
          const subject = subjectElement.textContent.trim();
          const downloadUrl = downloadLink.getAttribute('href');
          
          papers.push({
            subject: subject,
            downloadUrl: downloadUrl.startsWith('http') ? downloadUrl : `https://govdoc.lk${downloadUrl}`,
            id: `paper_${index + 1}`
          });
        }
      });
    }
    
    // If still no papers found, try a more generic approach
    if (papers.length === 0) {
      console.log('Trying generic approach...');
      
      // Look for common subject patterns
      const commonSubjects = [
        'Accounting', 'Agricultural Science', 'Art', 'Biology', 'Buddhism', 
        'Buddhist Civilization', 'Business Statistics', 'Business Studies', 
        'Chemistry', 'Christian Civilization', 'Christianity', 'Combined Mathematics',
        'Dance', 'Economics', 'Geography', 'Sivaneri', 'History', 
        'Information and Communication Technology', 'Islam', 'Logic & Scientific Method',
        'Physics', 'Political Science', 'Science for Technology', 'Sinhala',
        'Islam Civilization', 'General Information Technology'
      ];
      
      const allLinks = document.querySelectorAll('a[href*="govdoc.lk/view"]');
      const textContent = document.body.textContent;
      
      commonSubjects.forEach((subject, index) => {
        if (textContent.includes(subject)) {
          // Try to find a corresponding download link
          const linkElement = Array.from(allLinks).find(link => {
            const linkContext = link.closest('.col-12') || link.parentElement;
            return linkContext && linkContext.textContent.includes(subject);
          });
          
          if (linkElement) {
            const downloadUrl = linkElement.getAttribute('href');
            papers.push({
              subject: subject,
              downloadUrl: downloadUrl.startsWith('http') ? downloadUrl : `https://govdoc.lk${downloadUrl}`,
              id: `paper_${index + 1}`
            });
          }
        }
      });
    }
    
    console.log(`Successfully extracted ${papers.length} past papers`);
    
    // Return the scraped data
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
      },
      body: JSON.stringify({
        success: true,
        papers: papers,
        scrapedAt: new Date().toISOString(),
        source: 'https://govdoc.lk/page/gce-advanced-level-exam-2017-past-papers-sinhala'
      })
    };
    
  } catch (error) {
    console.error('Error in scraper:', error);
    
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      })
    };
  }
};
