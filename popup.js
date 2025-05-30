document.addEventListener('DOMContentLoaded', () => {
    chrome.storage.local.get('timeSpent', (data) => {
        const timeDisplay = document.getElementById('timeDisplay');
        timeDisplay.innerHTML = '';

        // Check if timeSpent data exists
        if (data.timeSpent && Object.keys(data.timeSpent).length > 0) {
            let index = 1;
            for (const [domain, time] of Object.entries(data.timeSpent)) {
                const timeElement = document.createElement('div');
                timeElement.textContent = `${index}. ${domain}: ${time.toFixed(2)} s`;
                timeDisplay.appendChild(timeElement);
                index++;
            }
        } else {
            const noDataElement = document.createElement('div');
            noDataElement.textContent = "No website data available.";
            timeDisplay.appendChild(noDataElement);
        }
    });
});
