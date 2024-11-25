const flagMap ={
    "Australia": "assets/flags/Australia.png",
    "Austria": "assets/flags/Austria.png",
    "Azerbaijan": "assets/flags/Azerbaijan.png",
    "Bahrain": "assets/flags/Bahrain.png",
    "Belgium": "assets/flags/Belgium.png",
    "Brazil": "assets/flags/Brazil.png",
    "UK": "assets/flags/British.png",
    "Canada": "assets/flags/Canada.png",
    "China": "assets/flags/China.png",
    "Netherlands": "assets/flags/Dutch.png",
    "Finland": "assets/flags/Finnish.png",
    "France": "assets/flags/France.png",
    "Germany": "assets/flags/German.png",
    "Hungary": "assets/flags/Hungary.png",
    "Italy": "assets/flags/Italy.png",
    "Japan": "assets/flags/Japan.png",
    "Mexico": "assets/flags/Mexico.png",
    "Monaco": "assets/flags/Monaco.png",
    "Poland": "assets/flags/Polish.png",
    "Portugal": "assets/flags/Portugal.png",
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
}   




async function fetchRaceCalendar() {
    try {
        const response = await fetch('http://ergast.com/api/f1/2024/races.json');
        if (!response.ok) throw new Error('Failed to fetch calendar data');

        const data = await response.json();
        const races = data.MRData.RaceTable.Races;
        const calendarContainer =

        let calendarBody = '';
        races.forEach((race, index) => {
            const raceDate = new Date(race.date).toLocaleDateString();
            const flag = race.Circuit.circuitName ===
        )}
    }
}