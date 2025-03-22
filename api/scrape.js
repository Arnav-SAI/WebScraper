const axios = require('axios');
const cheerio = require('cheerio');

module.exports = async (req, res) => {
  // Allow CORS for local development
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Log the request for debugging
  console.log('Received request to /api/scrape:', req.body);

  if (req.method !== 'POST') {
    console.log('Method not allowed:', req.method);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { url } = req.body;

  if (!url) {
    console.log('URL is required, received:', url);
    return res.status(400).json({ error: 'URL is required' });
  }

  try {
    // Ensure the URL starts with http:// or https://
    let targetUrl = url;
    if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
      targetUrl = `https://${targetUrl}`;
    }
    console.log('Fetching URL:', targetUrl);

    // Fetch the webpage with proper headers
    const response = await axios.get(targetUrl, {
      timeout: 10000, // 10 seconds timeout
      maxRedirects: 5, // Follow up to 5 redirects
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Connection': 'keep-alive',
      },
    });
    console.log('Received response from URL, status:', response.status);

    const html = response.data;

    // Load HTML into Cheerio
    const $ = cheerio.load(html);
    console.log('Loaded HTML into Cheerio');

    // Remove script, style, and other non-visible elements
    $('script, style, noscript, iframe, [hidden], [aria-hidden="true"]').remove();

    // Remove specific sections like language dropdown and footer
    // Gmail uses a <select> for languages and a footer for "Help Privacy Terms"
    $('select, footer, [role="contentinfo"], [aria-label="Language selection"]').remove();

    // Extract the page title
    const title = $('title').text().trim() || 'No title found';
    console.log('Extracted title:', title);

    // Extract content from specific elements (e.g., main content area)
    let content = '';
    // Target main content areas, excluding navigation, headers, and footers
    $('main, [role="main"], form, p, h1, h2, h3, h4, h5, h6, div:not([role="navigation"], [role="banner"])').each((i, elem) => {
      // Get text from the element
      let text = $(elem).text().trim();
      // Get placeholder text from input fields within this element
      $(elem).find('input[placeholder], textarea[placeholder]').each((j, input) => {
        const placeholder = $(input).attr('placeholder')?.trim();
        if (placeholder) {
          text += ` ${placeholder}`;
        }
      });
      // Add the text if it exists, with a space separator
      if (text) {
        content += text + ' ';
      }
    });

    // Clean up the content
    content = content.trim();
    // Replace multiple spaces with a single space, but preserve sentence structure
    content = content.replace(/\s+/g, ' ');
    // Remove control characters
    content = content.replace(/[\x00-\x1F\x7F-\x9F]/g, '');
    // If content is empty, provide a fallback
    content = content || 'No visible content found';
    console.log('Extracted content length:', content.length);

    // Construct the JSON response
    const data = {
      title,
      url: targetUrl,
      content,
    };

    console.log('Returning data:', data);
    return res.status(200).json(data);
  } catch (error) {
    // Log the error for debugging
    console.error('Error in /api/scrape:', error);

    // Provide detailed error information
    let errorMessage = 'Failed to scrape the website';
    if (error.response) {
      errorMessage = `HTTP error ${error.response.status}: ${error.response.statusText}`;
    } else if (error.request) {
      errorMessage = 'No response received from the website. It might be blocking the request.';
    } else {
      errorMessage = error.message;
    }
    console.log('Returning error:', errorMessage);
    return res.status(500).json({ error: errorMessage });
  }
};