document.addEventListener("DOMContentLoaded", () => {
    const urlInput = document.getElementById("url-input");
    const scrapeBtn = document.getElementById("scrape-btn");
    const jsonOutput = document.getElementById("json-output");
    const copyBtn = document.getElementById("copy-btn");
    const buttonText = scrapeBtn.querySelector(".button-text");
    const loadingIcon = scrapeBtn.querySelector(".loading-icon");

    scrapeBtn.addEventListener("click", async () => {
        const url = "https://" + urlInput.value.trim();
        if (!urlInput.value) {
            alert("Please enter a URL");
            return;
        }

        // Set button to loading state
        scrapeBtn.disabled = true;
        buttonText.textContent = "Scraping...";
        loadingIcon.style.display = "inline-block";

        jsonOutput.textContent = "{}";

        try {
            const response = await fetch("/scrape", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ url }),
            });

            if (!response.ok) {
                throw new Error("Failed to fetch");
            }

            const data = await response.json();
            const formattedJson = JSON.stringify(data, null, 2);
            jsonOutput.textContent = formattedJson;

            // Syntax highlighting
            jsonOutput.innerHTML = syntaxHighlight(formattedJson);
        } catch (error) {
            jsonOutput.textContent = JSON.stringify({ error: error.message }, null, 2);
        } finally {
            // Revert button to normal state
            scrapeBtn.disabled = false;
            buttonText.textContent = "Scrape";
            loadingIcon.style.display = "none";
        }
    });

    copyBtn.addEventListener("click", () => {
        const text = jsonOutput.textContent;
        navigator.clipboard.writeText(text).then(() => {
            alert("Copied to clipboard!");
        });
    });

    function syntaxHighlight(json) {
        json = json.replace(/&/g, "&").replace(/</g, "<").replace(/>/g, ">");
        return json.replace(
            /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,
            function (match) {
                let cls = "json-number";
                if (/^"/.test(match)) {
                    if (/:$/.test(match)) {
                        cls = "json-key";
                    } else {
                        cls = "json-string";
                    }
                } else if (/true|false/.test(match)) {
                    cls = "json-boolean";
                } else if (/null/.test(match)) {
                    cls = "json-null";
                }
                return '<span class="' + cls + '">' + match + "</span>";
            }
        );
    }
});