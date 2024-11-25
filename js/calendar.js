const flagMap ={
    "Australia": "assets/flags/Australia.png",
    "Austria": "assets/flags/Austria.png",
    "Azerbaijan": "assets/flags/Azerbaijan.png",
    "Bahrain": "assets/flags/Bahrain.png",
    "Belgium": "assets/flags/Belgium.png",
    "Brazil": "assets/flags/Brazil.png",
    "UK": "assets/flags/UK.png",
    "Canada": "assets/flags/Canada.png",
    "China": "assets/flags/China.png",
    "Netherlands": "assets/flags/Dutch.png",
    "Finland": "assets/flags/Finnish.png",
    "France": "assets/flags/France.png",
    "Germany": "assets/flags/Germany.png",
    "Hungary": "assets/flags/Hungary.png",
    "Italy": "assets/flags/Italy.png",
    "Japan": "assets/flags/Japan.png",
    "Mexico": "assets/flags/Mexico.png",
    "Monaco": "assets/flags/Monaco.png",
    "Poland": "assets/flags/Polish.png",
    "Portugal": "assets/flags/Portugal.png",
    "Qatar": "assets/flags/Qatar.png",
    "Russia": "assets/flags/Russia.png",
    "Saudi Arabia": "assets/flags/Saudi Arabia.png",
    "Singapore": "assets/flags/Singapore.png",
    "Spain": "assets/flags/Spain.png",
    "Switzerland": "assets/flags/Swiss.png",
    "Thailand": "assets/flags/Thai.png",
    "Turkey": "assets/flags/Turkey.png",
    "UAE": "assets/flags/UAE.png",
    "USA": "assets/flags/USA.png",
    "United States": "assets/flags/USA.png",
};


// Fetch and render the race calendar
async function fetchRaceCalendar() {
    try {
        // Fetch data from the Ergast API
        const response = await fetch('https://ergast.com/api/f1/2024.json');
        if (!response.ok) throw new Error('Failed to fetch race calendar data.');

        const data = await response.json();
        const races = data.MRData.RaceTable.Races;

        // Build the HTML table for the calendar
        let calendarHTML = '';
        races.forEach((race, index) => {
            const raceDate = new Date(race.date).toLocaleDateString();
            const country = race.Circuit.Location.country;
            const flag = flagMap[country] || 'assets/flags/default.png'; // Default flag if country is missing

            calendarHTML += `
                <tr>
                    <td>${index + 1}</td>
                    <td><img src="${flag}" alt="${country} flag" width="30"></td>
                    <td>${race.raceName}</td>
                    <td>${race.Circuit.circuitName}</td>
                    <td>${raceDate}</td>
                </tr>
            `;
        });

        // Insert the HTML into the calendar table
        document.getElementById('calendar-body').innerHTML = calendarHTML;
    } catch (error) {
        console.error('Error fetching race calendar:', error);
        document.getElementById('calendar-body').innerHTML = `
            <tr>
                <td colspan="5">Error loading race calendar. Please try again later.</td>
            </tr>
        `;
    }
}

// Initialize the calendar on page load
window.onload = fetchRaceCalendar;