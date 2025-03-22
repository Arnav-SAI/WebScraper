async function scrapeWebsite() {
    const url = document.getElementById('urlInput').value;
    const outputElement = document.getElementById('output');
  
    try {
      const response = await fetch('/api/scrape', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
  
      const data = await response.json();
      // Display the JSON response as plain text with indentation
      outputElement.textContent = JSON.stringify(data, null, 2);
      // Ensure the output element doesn’t apply any additional formatting
      outputElement.style.whiteSpace = 'pre'; // Preserve whitespace and line breaks
      outputElement.style.fontFamily = 'monospace'; // Use a monospace font for better readability
    } catch (error) {
      outputElement.textContent = `Error: ${error.message}`;
      outputElement.style.whiteSpace = 'pre';
      outputElement.style.fontFamily = 'monospace';
    }
  }