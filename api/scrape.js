const axios = require('axios');
const cheerio = require('cheerio');

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { url } = req.body;
  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }

  try {
    // Ensure the URL starts with http:// or https://
    let targetUrl = url;
    if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
      targetUrl = `https://${targetUrl}`;
    }

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

    const html = response.data;

    // Load HTML into Cheerio
    const $ = cheerio.load(html);

    // Remove script and style tags to avoid capturing JavaScript/CSS
    $('script, style').remove();

    // Extract the main content (body text)
    const content = $('body').text().replace(/\s+/g, ' ').trim();

    // Extract the page title
    const title = $('title').text().trim();

    // Construct the JSON response
    const data = {
      title: title,
      url: targetUrl,
      content: content,
    };

    return res.status(200).json(data);
  } catch (error) {
    // Provide detailed error information
    let errorMessage = 'Failed to scrape the website';
    if (error.response) {
      errorMessage = `HTTP error ${error.response.status}: ${error.response.statusText}`;
    } else if (error.request) {
      errorMessage = 'No response received from the website. It might be blocking the request.';
    } else {
      errorMessage = error.message;
    }
    return res.status(500).json({ error: errorMessage });
  }
}