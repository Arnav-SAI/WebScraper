import os
import logging
from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
import requests
from bs4 import BeautifulSoup

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Determine the absolute path to the templates and static directories
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
TEMPLATES_DIR = os.path.join(BASE_DIR, "..", "templates")
STATIC_DIR = os.path.join(BASE_DIR, "..", "static")

logger.info(f"Templates directory: {TEMPLATES_DIR}")
logger.info(f"Static directory: {STATIC_DIR}")

app = Flask(__name__, template_folder=TEMPLATES_DIR, static_folder=STATIC_DIR)
CORS(app)  # Enable CORS for API requests

# Health check endpoint for Vercel
@app.route("/health")
def health():
    logger.info("Health check endpoint accessed")
    return jsonify({"status": "healthy"}), 200

@app.route("/")
def index():
    logger.info("Rendering index.html")
    try:
        return render_template("index.html")
    except Exception as e:
        logger.error(f"Error rendering index.html: {str(e)}")
        return jsonify({"error": f"Failed to render template: {str(e)}"}), 500

@app.route("/scrape", methods=["POST"])
def scrape():
    logger.info("Scrape endpoint accessed")
    data = request.get_json()
    url = data.get("url")

    if not url:
        logger.warning("URL is required")
        return jsonify({"error": "URL is required"}), 400

    try:
        logger.info(f"Scraping URL: {url}")
        response = requests.get(url, timeout=3, headers={"User-Agent": "WebScraperAI/1.0"})
        response.raise_for_status()

        soup = BeautifulSoup(response.text, "html.parser")

        title = soup.title.string if soup.title else "No title found"
        content = soup.body.get_text(strip=True)[:1000] if soup.body else "No content found"

        logger.info("Scraping successful")
        return jsonify({
            "title": title,
            "url": url,
            "content": content
        })
    except requests.Timeout:
        logger.error("Request timed out")
        return jsonify({"error": "Request timed out. Try a different URL or try again later."}), 504
    except requests.RequestException as e:
        logger.error(f"Failed to fetch URL: {str(e)}")
        return jsonify({"error": f"Failed to fetch URL: {str(e)}"}), 500
    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}")
        return jsonify({"error": f"Unexpected error: {str(e)}"}), 500

if __name__ == "__main__":
    app.run(debug=True)