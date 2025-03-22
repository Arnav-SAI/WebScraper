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
        'Referer': 'https://www.google.com/',
        'Upgrade-Insecure-Requests': '1',
      },
    });
    console.log('Received response from URL, status:', response.status);

    const html = response.data;

    // Load HTML into Cheerio
    const $ = cheerio.load(html);
    console.log('Loaded HTML into Cheerio');

    // Extract the page title
    const title = $('title').text().trim() || 'No title found';
    console.log('Extracted title:', title);

    // Extract the meta description
    const metaDescription = $('meta[name="description"]').attr('content')?.trim() || 'No description found';
    console.log('Extracted meta description:', metaDescription);

    // Construct the JSON response in the desired format
    const data = {
      success: true,
      url: targetUrl,
      data: {
        title,
        meta: {
          description: metaDescription,
        },
        content: {}, // Empty object as per the desired output
      },
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

    // Return the error in the desired format
    return res.status(500).json({
      success: false,
      url: url || 'Unknown URL',
      error: errorMessage,
    });
  }
};