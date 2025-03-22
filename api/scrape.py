from flask import Flask, request, jsonify
import requests
from bs4 import BeautifulSoup

app = Flask(__name__)

@app.route('/api/scrape', methods=['POST'])
def scrape():
    data = request.get_json()
    url = data.get('url')
    if not url:
        return jsonify({"error": "URL is required"}), 400
    try:
        response = requests.get(url, timeout=5)
        response.raise_for_status()
        soup = BeautifulSoup(response.text, 'html.parser')
        title = soup.title.string.strip() if soup.title else "No title found"
        return jsonify({"title": title})
    except requests.RequestException as e:
        return jsonify({"error": str(e)}), 500

# Export the app for Vercel's WSGI support
application = app