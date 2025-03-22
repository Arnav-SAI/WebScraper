# 🕸️ WebScraper
webscraper is a streamlined tool for 🌐 web scraping, transforming unstructured websites into 📋 structured JSON data. Easily extract page titles, meta descriptions, and more with a user-friendly interface and API.
<br>
<br>

[!NOTE]<br>
Scrape websites and get structured JSON data with a single click or API call! 🚀


<br>
📖 #Overview
WebScraper is a lightweight and efficient web scraping tool designed to extract key information from websites, such as titles and meta descriptions, and present it in a clean JSON format. It’s perfect for developers, researchers, and SEO enthusiasts who need quick access to structured web data.

<br>

# 🌟Features
- 🔗 Broad Compatibility - Scrape data from a wide range of websites
- 📋 Structured JSON Output - Get clean, well-organized JSON data
- 📝 Key Data Extraction - Extracts page titles and meta descriptions
- 🖥️ Intuitive Interface - Modern UI with syntax-highlighted JSON display
- ⚙️ API Access - Simple API for programmatic scraping
- 📱 Responsive Design - Works seamlessly on desktop and mobile devices
<br>

# 🛠️ Technologies Used
- ⚡ Next.js + JavaScript
- 📄 Cheerio for HTML parsing
- 🌍 Axios for making HTTP requests
- 🎨 Custom CSS for a dark, modern UI
- ☁️ Vercel for hosting and deployment

<br>
## 📦 Installation

```bash
# Clone the repository
git clone https://github.com/Arnav-SAI/WebScraper.git

# Navigate to the project directory
cd WebScraper

# Install dependencies
npm install
```
<br>

## 📋 Usage

### Web Interface

1. Enter the **`URL`** you want to scrape
2. Click **`"Scrape"`**
3. View the structured **`JSON`** output

## Using the API
```
// Send a POST request to the scrape endpoint
const response = await fetch("/api/scrape", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ url: "https://gmail.com" })
});

const data = await response.json();
console.log(data);
```
<br>

# 📋 Sample Output
```
{
  "success": true,
  "url": "https://gmail.com",
  "data": {
    "title": "Gmail",
    "meta": {
      "description": "Gmail is email that’s intuitive, efficient, and useful. 15 GB of storage, less spam, and mobile access."
    },
    "content": {}
  }
}
```
<br>

