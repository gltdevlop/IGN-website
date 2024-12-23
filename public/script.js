fetch('/api/game_sessions')
    .then(response => response.json())
    .then(data => {
        const groupedData = data.reduce((acc, session) => {
            const key = `${session.game_name}:${session.user_name}`;
            if (!acc[key]) {
                acc[key] = {
                    game_name: session.game_name,
                    user_name: session.user_name,
                    total_duration: 0
                };
            }
            acc[key].total_duration += session.duration_minutes;
            return acc;
        }, {});

        const groupedArray = Object.values(groupedData);

        // Calculate total time for each game
        const gameTotalDurations = groupedArray.reduce((acc, entry) => {
            if (!acc[entry.game_name]) {
                acc[entry.game_name] = 0;
            }
            acc[entry.game_name] += entry.total_duration;
            return acc;
        }, {});

        // Sort data by total duration in descending order
        const sortedData = groupedArray.sort((a, b) => b.total_duration - a.total_duration);

        // Add game names with total duration to the sidebar
        const gameNames = [...new Set(groupedArray.map(entry => entry.game_name))];
        generateSidebar(gameNames, gameTotalDurations);

        // Instead of displaying total data, calculate and display player data directly
        const playerData = groupedArray.reduce((acc, entry) => {
            if (!acc[entry.user_name]) {
                acc[entry.user_name] = 0;
            }
            acc[entry.user_name] += entry.total_duration;
            return acc;
        }, {});

        const playerArray = Object.entries(playerData)
            .map(([name, total_duration]) => ({ name, total_duration }))
            .sort((a, b) => b.total_duration - a.total_duration);

        const rankedPlayerData = playerArray.map((player, index) => ({
            rank: `#${index + 1}`,
            name: player.name,
            total_duration: player.total_duration,
        }));

        displayPlayerData(rankedPlayerData);

        document.getElementById('dl').addEventListener('click', () => {
            window.open("https://github.com/gltdevlop/instagramnoteintegration/releases/latest", '_blank').focus();
        });

        document.getElementById('search-player-box').addEventListener('input', (event) => {
            const searchTerm = event.target.value.toLowerCase();
            const gameSearchTerm = document.getElementById('search-game-box').value.toLowerCase();
            filterTableRows(searchTerm, gameSearchTerm);
        });

// New handler for game search
        document.getElementById('search-game-box').addEventListener('input', (event) => {
            const gameSearchTerm = event.target.value.toLowerCase();
            const playerSearchTerm = document.getElementById('search-player-box').value.toLowerCase();
            filterTableRows(playerSearchTerm, gameSearchTerm);
        });

        // Handle click on Scoreboard Total
        document.getElementById('scoreboard-total').addEventListener('click', () => {
            displayData(sortedData); // Display total data
            updateURL('total'); // Update URL
            highlightActiveButton('scoreboard-total');
        });
        // Handle click on Scoreboard Players
        document.getElementById('scoreboard-players').addEventListener('click', () => {
            const playerData = sortedData.reduce((acc, entry) => {
                if (!acc[entry.user_name]) {
                    acc[entry.user_name] = 0;
                }
                acc[entry.user_name] += entry.total_duration;
                return acc;
            }, {});

            const playerArray = Object.entries(playerData)
                .map(([name, total_duration]) => ({ name, total_duration }))
                .sort((a, b) => b.total_duration - a.total_duration);

            const rankedPlayerData = playerArray.map((player, index) => ({
                rank: `#${index + 1}`,
                name: player.name,
                total_duration: player.total_duration,
            }));

            displayPlayerData(rankedPlayerData);
            highlightActiveButton('scoreboard-players');
            updateURL('players'); // Update URL
        });

        let currentSortOrder = 'desc';

        document.getElementById('enter-button').addEventListener('click', () => {
            document.getElementById('welcome-page').classList.add('hidden');
        });

        document.getElementById('sort-time').addEventListener('click', function() {
            currentSortOrder = currentSortOrder === 'desc' ? 'asc' : 'desc';
            this.innerHTML = `Sort by time ${currentSortOrder === 'desc' ? '↓' : '↑'}`;
            this.setAttribute('data-order', currentSortOrder);

            // Get the currently displayed table
            const activeButton = document.querySelector('.navbar button.active');
            if (!activeButton) return;

            switch (activeButton.id) {
                case 'scoreboard-total':
                    const tableBody = document.querySelector('#game-sessions-table tbody');
                    const rows = Array.from(tableBody.querySelectorAll('tr'));

                    rows.sort((a, b) => {
                        const timeStrA = a.lastElementChild.textContent.trim();
                        const timeStrB = b.lastElementChild.textContent.trim();
                        
                        // Extract hours and minutes with regex
                        const regexTime = /(\d+)\s*hour[s]?\s*(\d+)?\s*min/;
                        const matchA = timeStrA.match(regexTime);
                        const matchB = timeStrB.match(regexTime);
                        
                        const hoursA = matchA ? parseInt(matchA[1]) : 0;
                        const minutesA = matchA && matchA[2] ? parseInt(matchA[2]) : 0;
                        const hoursB = matchB ? parseInt(matchB[1]) : 0;
                        const minutesB = matchB && matchB[2] ? parseInt(matchB[2]) : 0;
                        
                        // Convert to total minutes
                        const totalMinutesA = hoursA * 60 + minutesA;
                        const totalMinutesB = hoursB * 60 + minutesB;
                        
                        return currentSortOrder === 'desc' ? totalMinutesB - totalMinutesA : totalMinutesA - totalMinutesB;
                    });

                    // Empty and refill the table
                    tableBody.innerHTML = '';
                    rows.forEach(row => tableBody.appendChild(row));
                    break;

                case 'scoreboard-players':
                    const playerTableBody = document.querySelector('#game-sessions-table tbody');
                    const playerRows = Array.from(playerTableBody.querySelectorAll('tr'));

                    playerRows.sort((a, b) => {
                        const timeStrA = a.lastElementChild.textContent.trim();
                        const timeStrB = b.lastElementChild.textContent.trim();
                        
                        // Extract hours and minutes with regex
                        const regexTime = /(\d+)\s*hour[s]?\s*(\d+)?\s*min/;
                        const matchA = timeStrA.match(regexTime);
                        const matchB = timeStrB.match(regexTime);
                        
                        const hoursA = matchA ? parseInt(matchA[1]) : 0;
                        const minutesA = matchA && matchA[2] ? parseInt(matchA[2]) : 0;
                        const hoursB = matchB ? parseInt(matchB[1]) : 0;
                        const minutesB = matchB && matchA[2] ? parseInt(matchB[2]) : 0;
                        
                        // Convert to total minutes
                        const totalMinutesA = hoursA * 60 + minutesA;
                        const totalMinutesB = hoursB * 60 + minutesB;
                        
                        return currentSortOrder === 'desc' ? totalMinutesB - totalMinutesA : totalMinutesA - totalMinutesB;
                    });

                    playerTableBody.innerHTML = '';
                    playerRows.forEach(row => playerTableBody.appendChild(row));
                    break;

                case 'scoreboard-games':
                    const gameTableBody = document.querySelector('#game-sessions-table tbody');
                    const gameRows = Array.from(gameTableBody.querySelectorAll('tr'));

                    gameRows.sort((a, b) => {
                        const timeStrA = a.lastElementChild.textContent.trim();
                        const timeStrB = b.lastElementChild.textContent.trim();
                        
                        // Extract hours and minutes with regex
                        const regexTime = /(\d+)\s*hour[s]?\s*(\d+)?\s*min/;
                        const matchA = timeStrA.match(regexTime);
                        const matchB = timeStrB.match(regexTime);
                        
                        const hoursA = matchA ? parseInt(matchA[1]) : 0;
                        const minutesA = matchA && matchA[2] ? parseInt(matchA[2]) : 0;
                        const hoursB = matchB ? parseInt(matchB[1]) : 0;
                        const minutesB = matchB && matchA[2] ? parseInt(matchB[2]) : 0;
                        
                        // Convert to total minutes
                        const totalMinutesA = hoursA * 60 + minutesA;
                        const totalMinutesB = hoursB * 60 + minutesB;
                        
                        return currentSortOrder === 'desc' ? totalMinutesB - totalMinutesA : totalMinutesA - totalMinutesB;
                    });

                    gameTableBody.innerHTML = '';
                    gameRows.forEach(row => gameTableBody.appendChild(row));
                    break;
            }
        });

        // Handle click on Scoreboard Games
        document.getElementById('scoreboard-games').addEventListener('click', () => {
            const gameData = sortedData.reduce((acc, entry) => {
                if (!acc[entry.game_name]) {
                    acc[entry.game_name] = 0;
                }
                acc[entry.game_name] += entry.total_duration;

                return acc;
            }, {});

            const gameArray = Object.entries(gameData)
                .map(([name, total_duration]) => ({ name, total_duration }))
                .sort((a, b) => b.total_duration - a.total_duration);

            updateURL('games');
            highlightActiveButton('scoreboard-games');
            displayGameData(gameArray);
        });

        // Handle click on games in the sidebar
        document.getElementById('game-list-items').addEventListener('click', (event) => {
            if (event.target.tagName === 'BUTTON') {
                const gameName = event.target.dataset.game;
                const filteredData = sortedData.filter(entry => entry.game_name === gameName);
                displayData(filteredData);
            }
        });

        // Handle search
        document.getElementById('search-box').addEventListener('input', (event) => {
            const searchTerm = event.target.value.toLowerCase();
            const buttons = document.querySelectorAll('#game-list-items button');
            buttons.forEach(button => {
                const gameName = button.textContent.toLowerCase();
                button.style.display = gameName.includes(searchTerm) ? 'block' : 'none';
            });
        });

        // Handle hamburger menu
        document.getElementById('menu-toggle').addEventListener('click', function() {
            this.classList.toggle('active');
            document.getElementById('nav-menu').classList.toggle('active');
        });

        // Close menu when clicking outside
        document.addEventListener('click', function(event) {
            const menu = document.getElementById('nav-menu');
            const menuToggle = document.getElementById('menu-toggle');
            
            if (!menu.contains(event.target) && !menuToggle.contains(event.target) && menu.classList.contains('active')) {
                menu.classList.remove('active');
                menuToggle.classList.remove('active');
            }
        });

        // Close menu after clicking on a button
        document.querySelectorAll('.nav-menu button').forEach(button => {
            button.addEventListener('click', () => {
                document.getElementById('nav-menu').classList.remove('active');
                document.getElementById('menu-toggle').classList.remove('active');
            });
        });
    })
    .catch(error => console.error('Error:', error));

function filterTableRows(playerSearchTerm, gameSearchTerm) {
    const gameSessionsContainer = document.getElementById('game-sessions-container');

    if (gameSessionsContainer.style.display !== 'none') {
        const tableBody = document.querySelector('#game-sessions-table tbody');
        const rows = tableBody.querySelectorAll('tr');

        rows.forEach(row => {
            const columns = row.querySelectorAll('td');
            let playerText = '';
            let gameText = '';

            if (columns.length === 3) {
                // Total sessions table
                gameText = columns[0].textContent.toLowerCase(); // Game name
                playerText = columns[1].textContent.toLowerCase(); // Player name
            } else if (columns.length === 2) {
                // Scoreboard players or games table
                const headerText = document.querySelector('#game-sessions-table thead th').textContent;
                if (headerText.includes('player')) {
                    // Scoreboard players
                    playerText = columns[0].textContent.toLowerCase().split('-')[1]?.trim() || '';
                } else {
                    // Scoreboard games
                    gameText = columns[0].textContent.toLowerCase();
                }
            }

            // Display the row only if it matches both search criteria
            const matchesPlayer = playerText.includes(playerSearchTerm);
            const matchesGame = gameText.includes(gameSearchTerm);
            const shouldDisplay = (playerSearchTerm === '' || matchesPlayer) &&
                (gameSearchTerm === '' || matchesGame);

            row.style.display = shouldDisplay ? 'table-row' : 'none';
        });
    }
}

function sortDataByTime(data, order = 'desc') {
    return [...data].sort((a, b) => {
        const timeA = typeof a.total_duration !== 'undefined' ? a.total_duration :
            typeof a.duration !== 'undefined' ? a.duration : 0;
        const timeB = typeof b.total_duration !== 'undefined' ? b.total_duration :
            typeof b.duration !== 'undefined' ? b.duration : 0;

        return order === 'desc' ? timeB - timeA : timeA - timeB;
    });
}


// Function to convert minutes to hours and minutes
function convertMinutesToHours(minutes) {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    if (hours === 0) {
        return `${remainingMinutes} min`;
    } else if (remainingMinutes === 0) {
        return `${hours} hour${hours > 1 ? 's' : ''}`;
    }
    return `${hours} hour${hours > 1 ? 's' : ''} ${remainingMinutes} min`;
}

function updateURL(category) {
    const url = new URL(window.location.href);
    url.searchParams.set('category', category);
    history.pushState({}, '', url);
}

function highlightActiveButton(activeButtonId) {
    document.querySelectorAll('.navbar button').forEach(button => {
        button.classList.remove('active');
    });
    document.getElementById(activeButtonId).classList.add('active');
}

// Handle initial load
window.addEventListener('load', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const category = urlParams.get('category') || 'players'; 
    highlightActiveButton(`scoreboard-${category}`);

    switch (category) {
        case 'players':
            const playerData = calculatePlayerData(sortedData); // Calculate player data
            displayPlayerData(playerData); // Display player data
            break;
        case 'games':
            const gameData = calculateGameData(sortedData); // Calculate game data
            displayGameData(gameData); // Display game data
            break;
        case 'total':
        default:
            displayData(sortedData); // Display total data by default
            break;
    }
});

function generateSidebar(gameNames, gameTotalDurations) {
    const gameList = document.getElementById('game-list-items');
    gameList.innerHTML = ''; // Clear the list before regenerating it

    const sortedGameNames = gameNames.sort((a, b) => (gameTotalDurations[b] || 0) - (gameTotalDurations[a] || 0));

    for (const gameName of sortedGameNames) {
        const button = document.createElement('button');
        const totalDuration = gameTotalDurations[gameName] || 0;
        const formattedDuration = convertMinutesToHours(totalDuration);
        button.textContent = `${gameName} - ${formattedDuration} total`;
        button.dataset.game = gameName;

        // Add event handler for click
        button.addEventListener('click', function() {
            // Remove active class from all buttons in the list
            const buttons = gameList.querySelectorAll('button');
            buttons.forEach(btn => btn.classList.remove('active'));
            
            // Add active class to the clicked button
            this.classList.add('active');

            // Ensure the Scoreboard Games button remains active
            highlightActiveButton('scoreboard-games');

            // Display player data for this game
            displayGamePlayerData(this.dataset.game);
        });

        gameList.appendChild(button);
    }
}

// Function to display player data for a specific game
function displayGamePlayerData(gameName) {
    const tableBody = document.querySelector('#game-sessions-table tbody');
    tableBody.innerHTML = '';

    // Hide the players container and display the sessions container
    document.getElementById('players-sessions-container').style.display = 'none';
    document.getElementById('game-sessions-container').style.display = 'block';

    // Filter and group data by player for this game
    fetch('/api/game_sessions')
        .then(response => response.json())
        .then(data => {
            // Group data by player for this specific game
            const playerTimes = data.reduce((acc, session) => {
                if (session.game_name === gameName) {
                    if (!acc[session.user_name]) {
                        acc[session.user_name] = 0;
                    }
                    acc[session.user_name] += session.duration_minutes;
                }
                return acc;
            }, {});

            // Convert to array and sort by duration
            const sortedPlayers = Object.entries(playerTimes)
                .map(([name, total_duration]) => ({ name, total_duration }))
                .sort((a, b) => b.total_duration - a.total_duration);

            // Clear the table before adding new data
            tableBody.innerHTML = '';

            // Display data in the table
            sortedPlayers.forEach((player, index) => {
                const row = document.createElement('tr');

                // Apply style for the top 3 players
                if (index === 0) {
                    row.style.backgroundColor = '#877619'; // Gold
                    row.style.color = '#000';
                    row.style.fontWeight = 'bold';
                } else if (index === 1) {
                    row.style.backgroundColor = '#9a9898'; // Silver
                    row.style.color = '#000';
                    row.style.fontWeight = 'bold';
                } else if (index === 2) {
                    row.style.backgroundColor = '#93500d'; // Bronze
                    row.style.color = '#000';
                    row.style.fontWeight = 'bold';
                }

                const rankCell = document.createElement('td');
                rankCell.textContent = `#${index + 1} - ${player.name}`;
                row.appendChild(rankCell);

                const gameCell = document.createElement('td');
                gameCell.textContent = gameName;
                row.appendChild(gameCell);

                const totalDurationCell = document.createElement('td');
                totalDurationCell.textContent = convertMinutesToHours(player.total_duration);
                row.appendChild(totalDurationCell);

                tableBody.appendChild(row);
            });

            // Update the table header
            const tableHeader = document.querySelector('#game-sessions-table thead');
            tableHeader.innerHTML = `
                <tr>
                    <th>Player Name</th>
                    <th>Game</th>
                    <th>Total Time</th>
                </tr>
            `;
        });
}

// Function to display player data in the table
function displayPlayerData(data) {
    const tableBody = document.querySelector('#game-sessions-table tbody');
    tableBody.innerHTML = ''; // Clear the table body before displaying it again

    const sortOrder = document.getElementById('sort-time').getAttribute('data-order');
    const sortedData = sortDataByTime(data, sortOrder);

    data.forEach((entry, index) => {
        const row = document.createElement('tr');

        // Apply style for the top 3 players
        if (index === 0) {
            row.style.backgroundColor = '#877619'; // Gold
            row.style.color = '#000'; // Black text
            row.style.fontWeight = 'bold'; // Bold text
        } else if (index === 1) {
            row.style.backgroundColor = '#9a9898'; // Silver
            row.style.color = '#000'; // Black text
            row.style.fontWeight = 'bold'; // Bold text
        } else if (index === 2) {
            row.style.backgroundColor = '#93500d'; // Bronze
            row.style.color = '#000'; // Black text
            row.style.fontWeight = 'bold'; // Bold text
        }

        const rankCell = document.createElement('td');
        rankCell.textContent = `#${index + 1} - ${entry.name}`;
        row.appendChild(rankCell);

        const totalDurationCell = document.createElement('td');
        totalDurationCell.textContent = convertMinutesToHours(entry.total_duration);
        row.appendChild(totalDurationCell);

        tableBody.appendChild(row);
    });

    const tableHeader = document.querySelector('#game-sessions-table thead');
    tableHeader.innerHTML = `
        <tr>
            <th>Player Name</th>
            <th>Total Duration</th>
        </tr>
    `;

    document.getElementById('game-sessions-container').style.display = 'block';
    document.getElementById('players-sessions-container').style.display = 'none';
}

// Function to display game data in the table
function displayGameData(data) {
    const tableBody = document.querySelector('#game-sessions-table tbody');
    tableBody.innerHTML = '';
    const sortOrder = document.getElementById('sort-time').getAttribute('data-order');
    const sortedData = sortDataByTime(data, sortOrder);

    for (const entry of data) {
        const row = document.createElement('tr');

        const gameNameCell = document.createElement('td');
        gameNameCell.textContent = entry.name;
        row.appendChild(gameNameCell);

        const totalDurationCell = document.createElement('td');
        totalDurationCell.textContent = convertMinutesToHours(entry.total_duration);
        row.appendChild(totalDurationCell);

        tableBody.appendChild(row);
    }

    // Hide unused columns for games
    const tableHeader = document.querySelector('#game-sessions-table thead');
    tableHeader.innerHTML = `
        <tr>
            <th>Game Name</th>
            <th>Total Time (all players)</th>
        </tr>
    `;

    document.getElementById('game-sessions-container').style.display = 'block';
    document.getElementById('players-sessions-container').style.display = 'none';
}

// Function to display data in the game sessions table
function displayData(data) {
    const tableBody = document.querySelector('#game-sessions-table tbody');
    tableBody.innerHTML = ''; // Clear the table body before displaying it again

    const sortOrder = document.getElementById('sort-time').getAttribute('data-order');
    const sortedData = sortDataByTime(data, sortOrder);

    for (const entry of data) {
        const row = document.createElement('tr');

        // Game name
        const gameNameCell = document.createElement('td');
        gameNameCell.textContent = entry.game_name;

        // Player name with Instagram link
        const userNameCell = document.createElement('td');
        const userLink = document.createElement('a');
        userLink.href = `https://instagram.com/${entry.user_name}`;
        userLink.textContent = entry.user_name;
        userLink.target = '_blank';
        userNameCell.appendChild(userLink);

        // Total duration
        const totalDurationCell = document.createElement('td');
        totalDurationCell.textContent = convertMinutesToHours(entry.total_duration);

        // Add cells to the table
        row.appendChild(gameNameCell);
        row.appendChild(userNameCell);
        row.appendChild(totalDurationCell);
        tableBody.appendChild(row);
    }

    // Reset the header for the three columns
    const tableHeader = document.querySelector('#game-sessions-table thead');
    tableHeader.innerHTML = `
        <tr>
            <th>Game Name</th>
            <th>Player Name</th>
            <th>Total Duration</th>
        </tr>
    `;

    document.getElementById('game-sessions-container').style.display = 'block';
    document.getElementById('players-sessions-container').style.display = 'none';
}