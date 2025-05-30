document.addEventListener('DOMContentLoaded', () => {
    chrome.storage.local.get('timeSpent', (data) => {
        const timeDisplay = document.getElementById('timeDisplay');
        timeDisplay.innerHTML = '';

        // Check if timeSpent data exists
        if (data.timeSpent) {
            for (const [domain, time] of Object.entries(data.timeSpent)) {
                const timeElement = document.createElement('div');
                timeElement.textContent = `${domain}: ${time.toFixed(2)} seconds`;
                timeDisplay.appendChild(timeElement);
            }
        } else {
            timeDisplay.textContent = "No data available.";
        }
    });
});
