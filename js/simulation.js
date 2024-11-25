import { fetchFromAPI } from './scripts.js';

console.log("Simulation script loaded.");

// Calculate required race wins
function calculateRequiredRaceWins(selectedDriver, leadingDriver, remainingRaces) {
    const pointsPerWin = 25;
    let pointsNeeded = leadingDriver.points - selectedDriver.points + 1; // Points needed to exceed the leader
    let requiredWins = 0;

    while (pointsNeeded > 0 && requiredWins < remainingRaces.length) {
        pointsNeeded -= pointsPerWin;
        requiredWins++;
    }

    return requiredWins;
}

// Calculate required sprint wins
function calculateRequiredSprintWins(selectedDriver, leadingDriver, remainingRaces) {
    const pointsForSprintWin = 8; // Assuming 8 points for sprint win
    let pointsNeeded = leadingDriver.points - selectedDriver.points + 1; // Points needed to exceed the leader
    let requiredSprints = 0;

    while (pointsNeeded > 0 && requiredSprints < remainingRaces.length) {
        pointsNeeded -= pointsForSprintWin;
        requiredSprints++;
    }

    return requiredSprints;
}

// Calculate required placements
function calculateRequiredPlacements(selectedDriver, leadingDriver, remainingRaces = [], remainingSprints = []) {
    const pointsPerWin = 25;
    const pointsFor2ndPlace = 18;
    const pointsFor3rdPlace = 15;
    const pointsForFastestLap = 1;

    let pointsNeeded = leadingDriver.points - selectedDriver.points + 1; // Points needed to exceed the leader
    let requiredPlacements = 0;

    // Process remaining races
    remainingRaces.forEach(() => {
        if (pointsNeeded <= 0) return; // Stop if the points are already enough
        pointsNeeded -= pointsPerWin; // Subtract points for a win
        requiredPlacements++;
        pointsNeeded -= pointsForFastestLap; // Assume fastest lap point is achieved
    });

    // Process remaining sprints
    remainingSprints.forEach(() => {
        if (pointsNeeded <= 0) return; // Stop if the points are already enough
        pointsNeeded -= 8; // Subtract points for a sprint win
        requiredPlacements++;
    });

    return requiredPlacements;
}

// Calculate required fastest laps
function calculateRequiredFastestLaps(selectedDriver, leadingDriver, remainingRaces) {
    const pointsForFastestLap = 1;

    // Points needed to exceed the leader
    let pointsNeeded = leadingDriver.points - selectedDriver.points + 1;
    let totalFastestLapsNeeded = 0;

    // Calculate the maximum possible points available from fastest laps
    const maxFastestLapsPossible = Math.min(remainingRaces.length, pointsNeeded);

    if (pointsNeeded > 0) {
        totalFastestLapsNeeded = Math.ceil(pointsNeeded / pointsForFastestLap);

        if (totalFastestLapsNeeded > maxFastestLapsPossible) {
            totalFastestLapsNeeded = maxFastestLapsPossible;
        }
    }

    return totalFastestLapsNeeded;
}

// Calculate the scenario
function calculateScenario(selectedDriver, leadingDriver, remainingRaces) {
    const remainingSprints = remainingRaces.filter((race) => race.Sprint);
    const remainingFullRaces = remainingRaces.filter((race) => !race.Sprint);

    const requiredRaceWins = calculateRequiredRaceWins(selectedDriver, leadingDriver, remainingFullRaces);
    const requiredSprintWins = calculateRequiredSprintWins(selectedDriver, leadingDriver, remainingSprints);
    const requiredFastestLaps = calculateRequiredFastestLaps(selectedDriver, leadingDriver, remainingFullRaces);
    const requiredPlacements = calculateRequiredPlacements(selectedDriver, leadingDriver, remainingFullRaces, remainingSprints);

    return {
        requiredRaceWins,
        requiredSprintWins,
        requiredFastestLaps,
        requiredPlacements,
    };
}

// Calculate maximum points remaining
function calculateMaxPoints(remainingRaces) {
    const pointsPerWin = 25;
    const sprintPointsPerWin = 8;
    const fastestLapPoints = 1;

    let totalPoints = 0;

    remainingRaces.forEach((race) => {
        totalPoints += pointsPerWin + fastestLapPoints; // Add race points
        if (race.Sprint) {
            totalPoints += sprintPointsPerWin; // Add sprint points
        }
    });

    return totalPoints;
}

// Overall championship simulation
async function simulateOverallScenario(selectedDriverId) {
    try {
        console.log("Simulating scenario for driver ID:", selectedDriverId);

        const raceData = await fetchFromAPI('current.json');
        const standingsData = await fetchFromAPI('current/driverStandings.json');

        if (!raceData || !standingsData) {
            document.getElementById('simulation-results').innerHTML = 'Error loading simulation data.';
            return;
        }

        const remainingRaces = raceData.MRData.RaceTable.Races.filter(race => new Date(race.date) > new Date());
        const standings = standingsData.MRData.StandingsTable.StandingsLists[0].DriverStandings;

        const selectedDriver = standings.find(d => d.Driver.driverId === selectedDriverId);
        const leadingDriver = standings.find(d => d.position === "1");

        if (!selectedDriver || !leadingDriver) {
            document.getElementById('simulation-results').innerHTML = 'Invalid driver data.';
            return;
        }

        const selectedDriverPoints = parseFloat(selectedDriver.points);
        const leadingDriverPoints = parseFloat(leadingDriver.points);

        // Check if the selected driver can mathematically win
        const maxRacePointsRemaining = calculateMaxPoints(remainingRaces);
        const selectedDriverPotentialPoints = selectedDriverPoints + maxRacePointsRemaining;

        if (selectedDriverPotentialPoints <= leadingDriverPoints) {
            document.getElementById('simulation-results').innerHTML = `
                ${selectedDriver.Driver.givenName} ${selectedDriver.Driver.familyName} cannot mathematically win the championship.
            `;
            return;
        }

        // Calculate scenario
        const scenario = calculateScenario(selectedDriver, leadingDriver, remainingRaces);

        // Result message
        const resultMessage = `
            In order for ${selectedDriver.Driver.givenName} ${selectedDriver.Driver.familyName} to win:
            - ${scenario.requiredRaceWins} race wins.
            - ${scenario.requiredSprintWins} sprint wins.
            - ${scenario.requiredFastestLaps} fastest laps.
            - Outperform ${leadingDriver.Driver.givenName} ${leadingDriver.Driver.familyName} in ${scenario.requiredPlacements} placements.
        `;
        document.getElementById('simulation-results').innerHTML = resultMessage;

    } catch (error) {
        console.error('Error simulating the overall scenario:', error);
        document.getElementById('simulation-results').innerHTML = 'Error simulating the overall scenario.';
    }
}

// Attach event listener to simulate button
document.getElementById('simulate-btn').addEventListener('click', () => {
    const selectedDriverId = document.getElementById('driver-select').value;
    simulateOverallScenario(selectedDriverId); // Simulate the overall championship scenario
});
