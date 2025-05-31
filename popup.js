document.addEventListener('DOMContentLoaded', () => {
  const timeDisplay = document.getElementById('timeDisplay');

  function updateTimeDisplay() {
    chrome.storage.local.get('timeSpent', (data) => {
      timeDisplay.innerHTML = '';

      // Check if timeSpent data exists
      if (data.timeSpent && Object.keys(data.timeSpent).length > 0) {
        let index = 1;
        // Sort domains by time spent (descending)
        const sortedDomains = Object.entries(data.timeSpent).sort((a, b) => b[1] - a[1]);
        for (const [domain, time] of sortedDomains) {
          const hours = Math.floor(time / 3600);
          const minutes = Math.floor((time % 3600) / 60);
          const seconds = Math.floor(time % 60); // Whole seconds for cleaner display
          let timeString = '';
          if (hours > 0) {
            timeString += `${hours} hr `;
          }
          if (minutes > 0 || hours > 0) {
            timeString += `${minutes} min `;
          }
          timeString += `${seconds} s`;
          const timeElement = document.createElement('div');
          timeElement.innerHTML = `${index}. <strong>${domain}</strong>: ${timeString}`;
          timeDisplay.appendChild(timeElement);
          index++;
        }
      } else {
        const noDataElement = document.createElement('div');
        noDataElement.textContent = 'No website data available.';
        timeDisplay.appendChild(noDataElement);
      }
    });
  }

  // Initial display
  updateTimeDisplay();
  // Update the time display every 5 seconds
  setInterval(updateTimeDisplay, 5000);
});
