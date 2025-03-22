const axios = require('axios');
const cheerio = require('cheerio');

export default async function handler(req, res) {
  // Log the start of the function for debugging
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
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Connection': 'keep-alive',
      },
      timeout: 10000, // 10 seconds timeout
      maxRedirects: 5, // Follow up to 5 redirects
    });

    console.log('Received response from URL, status:', response.status);

    const html = response.data;

    // Load HTML into Cheerio
    const $ = cheerio.load(html);
    console.log('Loaded HTML into Cheerio');

    // Remove script and style tags to avoid capturing JavaScript/CSS
    $('script, style').remove();

    // Extract the main content (body text)
    const content = $('body').text().replace(/\s+/g, ' ').trim();
    console.log('Extracted content length:', content.length);

    // Extract the page title
    const title = $('title').text().trim();
    console.log('Extracted title:', title);

    // Construct the JSON response
    const data = {
      title: title,
      url: targetUrl,
      content: content,
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
}