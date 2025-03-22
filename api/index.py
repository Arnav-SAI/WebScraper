import os
from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
import requests
from bs4 import BeautifulSoup

app = Flask(__name__, template_folder="../templates", static_folder="../static")
CORS(app)  # Enable CORS for API requests

# Add a health check endpoint for Vercel to verify the app is running
@app.route("/health")
def health():
    return jsonify({"status": "healthy"}), 200

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/scrape", methods=["POST"])
def scrape():
    data = request.get_json()
    url = data.get("url")

    if not url:
        return jsonify({"error": "URL is required"}), 400

    try:
        # Use a short timeout to avoid Vercel's 10-second limit (free plan)
        response = requests.get(url, timeout=3, headers={"User-Agent": "WebScraperAI/1.0"})
        response.raise_for_status()

        # Parse with BeautifulSoup
        soup = BeautifulSoup(response.text, "html.parser")

        # Extract data (keep it lightweight to avoid memory issues)
        title = soup.title.string if soup.title else "No title found"
        content = soup.body.get_text(strip=True)[:1000] if soup.body else "No content found"  # Limit content size

        return jsonify({
            "title": title,
            "url": url,
            "content": content
        })
    except requests.Timeout:
        return jsonify({"error": "Request timed out. Try a different URL or try again later."}), 504
    except requests.RequestException as e:
        return jsonify({"error": f"Failed to fetch URL: {str(e)}"}), 500
    except Exception as e:
        return jsonify({"error": f"Unexpected error: {str(e)}"}), 500

# Vercel serverless function handler
def handler(event, context):
    from werkzeug.middleware.dispatcher import DispatcherMiddleware
    from werkzeug.wrappers import Request, Response

    # Create a WSGI application
    application = DispatcherMiddleware(app)
    request = Request(event)
    response = Response.from_app(application, request.environ)

    return {
        "statusCode": response.status_code,
        "headers": dict(response.headers),
        "body": response.get_data(as_text=True)
    }

if __name__ == "__main__":
    app.run(debug=True)