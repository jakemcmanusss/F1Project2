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

function calculateRequiredPlacements(selectedDriver, leadingDriver, remainingRaces = [], remainingSprints = []) {
    const pointsPerWin = 25;
    const pointsFor2ndPlace = 18;
    const pointsFor3rdPlace = 15;
    const pointsForFastestLap = 1;

    let requiredPlacements = 0;
    let pointsNeeded = leadingDriver.points - selectedDriver.points + 1; // Points needed to exceed the leader

    const totalAvailableRaces = remainingRaces.length + remainingSprints.length; // Total remaining races and sprints

    // Check how many races or sprints are needed to gain points
    while (pointsNeeded > 0 && requiredPlacements < totalAvailableRaces) {
        // Simulate the selected driver winning the next placement
        pointsNeeded -= pointsPerWin; // Assume selected driver wins
        requiredPlacements++;

        // Simulate the leading driver finishing in 2nd
        pointsNeeded -= (pointsFor2ndPlace - pointsPerWin); 

        // If there's still a need for points, assume the leader finishes in 3rd
        if (pointsNeeded > 0) {
            pointsNeeded -= (pointsFor3rdPlace - pointsPerWin);
            requiredPlacements++;
        }

        // Add a fastest lap to the points needed
        pointsNeeded -= pointsForFastestLap;
        if (pointsNeeded > 0) {
            requiredPlacements++;
        }
    }

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
    
    // If pointsNeeded is greater than zero, calculate fastest laps needed
    if (pointsNeeded > 0) {
        // Each fastest lap gives 1 point
        totalFastestLapsNeeded = Math.ceil(pointsNeeded / pointsForFastestLap);
        
        // Ensure that we do not ask for more fastest laps than remaining races
        if (totalFastestLapsNeeded > maxFastestLapsPossible) {
            totalFastestLapsNeeded = maxFastestLapsPossible;
        }
    }

    return totalFastestLapsNeeded;
}


// Update the scenario calculation function to utilize the new logic
function calculateScenario(selectedDriver, leadingDriver, remainingRaces) {
    let requiredRaceWins = calculateRequiredRaceWins(selectedDriver, leadingDriver, remainingRaces);
    let requiredSprintWins = calculateRequiredSprintWins(selectedDriver, leadingDriver, remainingRaces);
    let requiredFastestLaps = calculateRequiredFastestLaps(selectedDriver, leadingDriver, remainingRaces);
    let requiredPlacements = calculateRequiredPlacements(selectedDriver, leadingDriver, remainingRaces);

    return {
        requiredRaceWins,
        requiredSprintWins,
        requiredFastestLaps,
        requiredPlacements
    };
}

// Overall championship simulation
async function simulateOverallScenario(selectedDriverId) {
    try {
        const raceResponse = await fetch(`${localProxy}current.json`);
        const raceData = await raceResponse.json();
        const remainingRaces = raceData.MRData.RaceTable.Races.filter(race => new Date(race.date) > new Date());

        const standingsResponse = await fetch(`${localProxy}current/driverStandings.json`);
        const standingsData = await standingsResponse.json();
        const standings = standingsData.MRData.StandingsTable.StandingsLists[0].DriverStandings;

        const selectedDriver = standings.find(d => d.Driver.driverId === selectedDriverId);
        const leadingDriver = standings.find(d => d.position === "1");

        const selectedDriverPoints = parseFloat(selectedDriver.points);
        const leadingDriverPoints = parseFloat(leadingDriver.points);

        // Check if the selected driver is the leading driver
        let resultMessage;
        if (selectedDriverId === leadingDriver.Driver.driverId) {
            resultMessage = `${selectedDriver.Driver.givenName} ${selectedDriver.Driver.familyName} is favored to win the season!`;
        } else {
            // Calculate the maximum points remaining for the selected driver
            const maxRacePointsRemaining = calculateMaxPoints(remainingRaces);
            const selectedDriverPotentialPoints = selectedDriverPoints + maxRacePointsRemaining;

            if (selectedDriverPotentialPoints <= leadingDriverPoints) {
                resultMessage = `${selectedDriver.Driver.givenName} ${selectedDriver.Driver.familyName} cannot mathematically win the championship.`;
            } else {
                // Updated output format
                const scenario = calculateScenario(selectedDriver, leadingDriver, remainingRaces);
                resultMessage = `In order for ${selectedDriver.Driver.givenName} ${selectedDriver.Driver.familyName} to win the Driver Championship:
                - They must win at least ${scenario.requiredRaceWins} out of ${remainingRaces.length} remaining races.
                - They should secure at least ${scenario.requiredFastestLaps} fastest laps.
                - They must finish ahead of Max Verstappen in at least ${scenario.requiredPlacements} races and sprints combined.`;
            }
        }

        document.getElementById('simulation-results').innerHTML = resultMessage;

    } catch (error) {
        console.error('Error simulating the overall scenario:', error);
        document.getElementById('simulation-results').innerHTML = 'Error simulating the overall scenario.';
    }
}


// Function to calculate maximum possible points remaining
function calculateMaxPoints(remainingRaces) {
    const pointsPerWin = 25;
    const sprintPointsPerWin = 8;
    const fastestLapPoints = 1;
    let totalPoints = 0;

    remainingRaces.forEach(race => {
        totalPoints += pointsPerWin + fastestLapPoints;  // Add points for winning race and fastest lap
        if (race.Sprint) {
            totalPoints += sprintPointsPerWin;  // Add points for winning sprint
        }
    });

    return totalPoints;
}

// Attach event listener to simulate button
document.getElementById('simulate-btn').addEventListener('click', () => {
    const selectedDriverId = document.getElementById('driver-select').value;
    simulateOverallScenario(selectedDriverId);  // Simulate the overall championship scenario
});
