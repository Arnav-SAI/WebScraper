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
    // Fetch the webpage
    const response = await axios.get(url);
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
      url: url,
      content: content,
    };

    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
