const axios = require('axios');
const cheerio = require('cheerio');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { url } = req.body;

  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }

  try {
    const response = await axios.get(url, {
      timeout: 5000,
      headers: { 'User-Agent': 'WebScraperAI/1.0' },
    });
    const $ = cheerio.load(response.data);
    const title = $('title').text().trim() || 'No title found';
    const content = $('body').text().trim().slice(0, 1000) || 'No content found';

    res.status(200).json({ title, url, content });
  } catch (error) {
    res.status(500).json({ error: `Failed to scrape: ${error.message}` });
  }
};