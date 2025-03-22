import requests
from bs4 import BeautifulSoup

def handler(request):
    try:
        if request.method != "POST":
            return {
                "statusCode": 405,
                "body": "Method Not Allowed"
            }

        data = request.json
        url = data.get("url")
        if not url:
            return {
                "statusCode": 400,
                "body": {"error": "URL is required"}
            }

        response = requests.get(url, timeout=5, headers={"User-Agent": "WebScraperAI/1.0"})
        response.raise_for_status()

        soup = BeautifulSoup(response.text, "html.parser")
        title = soup.title.string.strip() if soup.title else "No title found"
        content = soup.body.get_text(strip=True)[:1000] if soup.body else "No content found"

        return {
            "statusCode": 200,
            "body": {"title": title, "url": url, "content": content}
        }

    except requests.RequestException as e:
        return {
            "statusCode": 500,
            "body": {"error": f"Failed to fetch URL: {str(e)}"}
        }
    except Exception as e:
        return {
            "statusCode": 500,
            "body": {"error": f"Unexpected error: {str(e)}"}
        }