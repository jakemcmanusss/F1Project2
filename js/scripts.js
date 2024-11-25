const localProxy = 'https://ergast.com/api/f1/';


// Function to handle errors
function handleError(section, message) {
    const sectionElement = document.querySelector(section + ' tbody');
    if (sectionElement) {
        sectionElement.innerHTML = `<tr><td colspan="100%">${message}</td></tr>`;
    }
}

// Function to fetch driver standings (top 10)
async function fetchDriverStandings() {
    try {
        const response = await fetch(`${localProxy}current/driverStandings.json`);
        if (!response.ok) throw new Error('Failed to fetch driver standings');
        const data = await response.json();
        const standings = data.MRData.StandingsTable.StandingsLists[0].DriverStandings;

        let driverTable = '';
        standings.slice(0, 10).forEach((driver, index) => {
            driverTable += `
                <tr>
                    <td>${index + 1}</td>
                    <td>${driver.Driver.givenName} ${driver.Driver.familyName}</td>
                    <td>${driver.Constructors[0].name}</td>
                    <td>${driver.points}</td>
                </tr>`;
        });
        document.querySelector('.driver-standings tbody').innerHTML = driverTable;

    } catch (error) {
        console.error('Error fetching driver standings:', error);
        handleError('.driver-standings', 'Error loading driver standings.');
    }
}

// Function to display full driver standings
function showFullDriverStandings() {
    fetch(`${localProxy}current/driverStandings.json`)
        .then(response => response.json())
        .then(data => {
            const standings = data.MRData.StandingsTable.StandingsLists[0].DriverStandings;
            let fullStandings = '<h2>Full Driver Standings</h2><table><thead><tr><th>Pos.</th><th>Driver</th><th>Constructor</th><th>Pts.</th></tr></thead><tbody>';
            standings.forEach((driver, index) => {
                fullStandings += `<tr><td>${index + 1}</td><td>${driver.Driver.givenName} ${driver.Driver.familyName}</td><td>${driver.Constructors[0].name}</td><td>${driver.points}</td></tr>`;
            });
            fullStandings += '</tbody></table>';
            document.getElementById('modal-body').innerHTML = fullStandings;
            document.getElementById('full-results-modal').style.display = 'block'; // Show modal
        })
        .catch(error => console.error('Error fetching full driver standings:', error));
}

// Event listener for full driver standings button
document.getElementById('full-driver-standings-btn').addEventListener('click', showFullDriverStandings);

// Fetch Constructor Standings
async function fetchConstructorStandings() {
    try {
        const response = await fetch(`${localProxy}current/constructorStandings.json`);
        if (!response.ok) throw new Error('Failed to fetch constructor standings');
        const data = await response.json();
        const standings = data.MRData.StandingsTable.StandingsLists[0].ConstructorStandings;

        let constructorTable = '';
        standings.forEach((constructor, index) => {
            constructorTable += `
                <tr>
                    <td>${index + 1}</td>
                    <td>${constructor.Constructor.name}</td>
                    <td>${constructor.points}</td>
                    <td>${constructor.wins}</td>
                </tr>`;
        });
        document.querySelector('.standings tbody').innerHTML = constructorTable;
    } catch (error) {
        console.error('Error fetching constructor standings:', error);
        handleError('.standings', 'Error loading constructor standings.');
    }
}

// Function to fetch last race results (top 10)
async function fetchLastRaceResults() {
    try {
        const response = await fetch(`${localProxy}current/last/results.json`);
        if (!response.ok) throw new Error('Failed to fetch last race results');

        const data = await response.json();
        const lastRace = data.MRData.RaceTable.Races[0];
        const results = lastRace.Results;

        document.querySelector('.last-race h2').textContent = `Last Race: ${lastRace.raceName}`;
        document.querySelector('.last-race p').textContent = `${lastRace.Circuit.circuitName} | ${lastRace.date}`;

        // Show only the top 10 drivers
        let raceResultsTable = '';
        results.slice(0, 10).forEach((result, index) => {
            raceResultsTable += `
                <tr>
                    <td>${index + 1}</td>
                    <td>${result.Driver.givenName} ${result.Driver.familyName}</td>
                    <td>${result.Constructor.name}</td>
                    <td>${result.laps}</td>
                    <td>${result.Time ? result.Time.time : 'N/A'}</td>
                    <td>${result.points}</td>
                </tr>`;
        });
        document.querySelector('.last-race tbody').innerHTML = raceResultsTable;

    } catch (error) {
        console.error('Error fetching last race results:', error);
        handleError('.last-race', 'Error loading last race results.');
    }
}

// Function to display full race results
function showFullRaceResults() {
    fetch(`${localProxy}current/last/results.json`)
        .then(response => response.json())
        .then(data => {
            const results = data.MRData.RaceTable.Races[0].Results;
            let fullResults = '<h2>Full Race Results</h2><table><thead><tr><th>Pos.</th><th>Driver</th><th>Constructor</th><th>Laps</th><th>Time</th><th>Pts.</th></tr></thead><tbody>';
            results.forEach((result, index) => {
                fullResults += `<tr><td>${index + 1}</td><td>${result.Driver.givenName} ${result.Driver.familyName}</td><td>${result.Constructor.name}</td><td>${result.laps}</td><td>${result.Time ? result.Time.time : 'N/A'}</td><td>${result.points}</td></tr>`;
            });
            fullResults += '</tbody></table>';
            document.getElementById('modal-body').innerHTML = fullResults;
            document.getElementById('full-results-modal').style.display = 'block'; // Show modal
        })
        .catch(error => console.error('Error fetching full race results:', error));
}

// Event listener for full race results button
document.getElementById('full-race-results-btn').addEventListener('click', showFullRaceResults);

// Fetch Next Race Information
async function fetchNextRace() {
    try {
        const response = await fetch(`${localProxy}current.json`);
        if (!response.ok) throw new Error('Failed to fetch next race information');

        const data = await response.json();
        const races = data.MRData.RaceTable.Races;
        const nextRace = races.find(race => new Date(race.date) > new Date());

        document.querySelector('.next-race h2').textContent = `Next Race: ${nextRace.raceName}`;
        document.querySelector('.next-race p').textContent = `${nextRace.Circuit.circuitName} | ${nextRace.date}`;

        // Start the countdown
        if (nextRace) startCountdown(nextRace.date, nextRace.time);
    } catch (error) {
        console.error('Error fetching next race information:', error);
        document.querySelector('.next-race h2').textContent = 'Error loading next race.';
    }
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

// Fetch Drivers for Simulation
async function fetchDriversForSimulation() {
    try {
        const response = await fetch(`${localProxy}current/driverStandings.json`);
        const data = await response.json();
        const standings = data.MRData.StandingsTable.StandingsLists[0].DriverStandings;

        const selectElement = document.getElementById('driver-select');
        selectElement.innerHTML = ""; // Clear existing options
        standings.forEach(driver => {
            const option = document.createElement('option');
            option.value = driver.Driver.driverId;
            option.text = `${driver.Driver.givenName} ${driver.Driver.familyName}`;
            selectElement.appendChild(option);
        });
    } catch (error) {
        console.error('Error fetching drivers:', error);
    }
}


// Close modal functionality
document.getElementById('close-modal').addEventListener('click', function() {
    document.getElementById('full-results-modal').style.display = 'none'; // Hide modal
});

// Initialize the app by fetching data
async function init() {
    await fetchNextRace();
    await fetchLastRaceResults();
    await fetchDriverStandings();
    await fetchConstructorStandings();
    await fetchDriversForSimulation();
}

// Call init when the page loads
window.onload = init;
