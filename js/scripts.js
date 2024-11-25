import { trackMap } from './trackMap.js';

const localProxy = 'https://ergast.com/api/f1/';

// Centralized API Fetch Function
export async function fetchFromAPI(endpoint) {
    try {
        const response = await fetch(`${localProxy}${endpoint}`);
        if (!response.ok) throw new Error(`Failed to fetch: ${endpoint}`);
        return await response.json();
    } catch (error) {
        console.error(`Error fetching ${endpoint}:`, error);
        return null;
    }
}

// Helper function to populate driver dropdown
async function fetchDriversForSimulation() {
    const data = await fetchFromAPI('current/driverStandings.json');
    if (!data) {
        console.error('Error fetching driver data for simulation.');
        return;
    }

    const standings = data.MRData.StandingsTable.StandingsLists[0].DriverStandings;
    const selectElement = document.getElementById('driver-select');
    selectElement.innerHTML = ""; // Clear existing options

    standings.forEach((driver) => {
        const option = document.createElement('option');
        option.value = driver.Driver.driverId;
        option.text = `${driver.Driver.givenName} ${driver.Driver.familyName}`;
        selectElement.appendChild(option);
    });

    console.log("Drivers fetched for simulation:", standings);
}

// Helper function to render tables
function renderTable(containerSelector, rows) {
    const container = document.querySelector(containerSelector + ' tbody');
    if (container) container.innerHTML = rows;
}

// Function to handle errors and display messages
function handleError(section, message) {
    renderTable(section, `<tr><td colspan="100%">${message}</td></tr>`);
}

// Fetch and display driver standings
async function fetchDriverStandings() {
    const data = await fetchFromAPI('current/driverStandings.json');
    if (!data) {
        handleError('.driver-standings', 'Error loading driver standings.');
        return;
    }

    const standings = data.MRData.StandingsTable.StandingsLists[0].DriverStandings;
    const rows = standings.slice(0, 10).map((driver, index) => `
        <tr>
            <td>${index + 1}</td>
            <td>${driver.Driver.givenName} ${driver.Driver.familyName}</td>
            <td>${driver.Constructors[0].name}</td>
            <td>${driver.points}</td>
        </tr>
    `).join('');
    renderTable('.driver-standings', rows);
}

// Fetch and display constructor standings
async function fetchConstructorStandings() {
    const data = await fetchFromAPI('current/constructorStandings.json');
    if (!data) {
        handleError('.standings', 'Error loading constructor standings.');
        return;
    }

    const standings = data.MRData.StandingsTable.StandingsLists[0].ConstructorStandings;
    const rows = standings.map((constructor, index) => `
        <tr>
            <td>${index + 1}</td>
            <td>${constructor.Constructor.name}</td>
            <td>${constructor.points}</td>
            <td>${constructor.wins}</td>
        </tr>
    `).join('');
    renderTable('.standings', rows);
}

// Fetch and display last race results
async function fetchLastRaceResults() {
    const data = await fetchFromAPI('current/last/results.json');
    if (!data) {
        handleError('.last-race', 'Error loading last race results.');
        return;
    }

    const lastRace = data.MRData.RaceTable.Races[0];
    const results = lastRace.Results;

    document.querySelector('.last-race h2').textContent = `Last Race: ${lastRace.raceName}`;
    document.querySelector('.last-race p').textContent = `${lastRace.Circuit.circuitName} | ${lastRace.date}`;

    const rows = results.slice(0, 10).map((result, index) => `
        <tr>
            <td>${index + 1}</td>
            <td>${result.Driver.givenName} ${result.Driver.familyName}</td>
            <td>${result.Constructor.name}</td>
            <td>${result.laps}</td>
            <td>${result.Time ? result.Time.time : 'N/A'}</td>
            <td>${result.points}</td>
        </tr>
    `).join('');
    renderTable('.last-race', rows);
}

// Fetch and display next race information
async function fetchNextRace() {
    const data = await fetchFromAPI('current.json');
    if (!data) {
        document.querySelector('.next-race h2').textContent = 'Error loading next race.';
        return;
    }

    const races = data.MRData.RaceTable.Races;
    const nextRace = races.find(race => new Date(race.date) > new Date());
    if (!nextRace) {
        document.querySelector('.next-race h2').textContent = 'No upcoming races.';
        return;
    }

    document.querySelector('.next-race h2').textContent = `Next Race: ${nextRace.raceName}`;
    document.querySelector('.next-race p').textContent = `${nextRace.Circuit.circuitName} | ${nextRace.date}`;

    const trackImage = document.getElementById('track-image');
    const circuitName = nextRace.Circuit.circuitName;
    const trackFile = trackMap[circuitName] || "default.svg"; // Fallback to default.svg if not found
    trackImage.src = `assets/tracks/${trackFile}`;
    trackImage.alt = `${nextRace.Circuit.circuitName} Track`;
    startCountdown(nextRace.date, nextRace.time);
}

// Countdown Timer
function startCountdown(raceDate, raceTime) {
    const raceDateTime = new Date(`${raceDate}T${raceTime}`);
    const countdownInterval = setInterval(() => {
        const now = new Date().getTime();
        const distance = raceDateTime - now;

        if (distance < 0) {
            clearInterval(countdownInterval);
            document.querySelector('.countdown').innerHTML = "Race has started!";
            return;
        }

        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        document.getElementById("days").innerHTML = days;
        document.getElementById("hours").innerHTML = hours;
        document.getElementById("minutes").innerHTML = minutes;
        document.getElementById("seconds").innerHTML = seconds;
    }, 1000);
}

// Initialize the app
async function init() {
    await fetchNextRace();
    await fetchLastRaceResults();
    await fetchDriverStandings();
    await fetchConstructorStandings();
    await fetchDriversForSimulation(); // Populate driver dropdown
}

window.onload = init;
