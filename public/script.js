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

        // Calculer le temps total pour chaque jeu
        const gameTotalDurations = groupedArray.reduce((acc, entry) => {
            if (!acc[entry.game_name]) {
                acc[entry.game_name] = 0;
            }
            acc[entry.game_name] += entry.total_duration;
            return acc;
        }, {});

        // Trier les données par durée totale décroissante
        const sortedData = groupedArray.sort((a, b) => b.total_duration - a.total_duration);

        // Ajouter les noms de jeux avec leur durée totale dans la sidebar
        const gameNames = [...new Set(groupedArray.map(entry => entry.game_name))];
        generateSidebar(gameNames, gameTotalDurations);

        // Afficher toutes les données triées au chargement
        displayData(sortedData);

        document.getElementById('dl').addEventListener('click', () => {
            window.location.href = "https://github.com/gltdevlop/instagramnoteintegration/releases/latest";
        });

        document.getElementById('search-player-box').addEventListener('input', (event) => {
            const searchTerm = event.target.value.toLowerCase();
            const gameSearchTerm = document.getElementById('search-game-box').value.toLowerCase();
            filterTableRows(searchTerm, gameSearchTerm);
        });

// Nouveau gestionnaire pour la recherche de jeux
        document.getElementById('search-game-box').addEventListener('input', (event) => {
            const gameSearchTerm = event.target.value.toLowerCase();
            const playerSearchTerm = document.getElementById('search-player-box').value.toLowerCase();
            filterTableRows(playerSearchTerm, gameSearchTerm);
        });

        // Gestion du clic sur Scoreboard Total
        document.getElementById('scoreboard-total').addEventListener('click', () => {
            displayData(sortedData); // Affiche les données globales
            updateURL('total'); // Met à jour l'URL
            highlightActiveButton('scoreboard-total');
        });
        // Gestion du clic sur Scoreboard Joueurs
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
            updateURL('players'); // Met à jour l'URL
        });

        let currentSortOrder = 'desc';

        document.getElementById('enter-button').addEventListener('click', () => {
            document.getElementById('welcome-page').classList.add('hidden');
        });

        document.getElementById('sort-time').addEventListener('click', function() {
            currentSortOrder = currentSortOrder === 'desc' ? 'asc' : 'desc';
            this.innerHTML = `Tri par temps ${currentSortOrder === 'desc' ? '↓' : '↑'}`;
            this.setAttribute('data-order', currentSortOrder);

            // Récupérer le tableau actuellement affiché
            const activeButton = document.querySelector('.navbar button.active');
            if (!activeButton) return;

            switch (activeButton.id) {
                case 'scoreboard-total':
                    const tableBody = document.querySelector('#game-sessions-table tbody');
                    const rows = Array.from(tableBody.querySelectorAll('tr'));

                    rows.sort((a, b) => {
                        const timeA = parseFloat(a.lastElementChild.textContent.split('heure')[0]);
                        const timeB = parseFloat(b.lastElementChild.textContent.split('heure')[0]);
                        return currentSortOrder === 'desc' ? timeB - timeA : timeA - timeB;
                    });

                    // Vider et reremplir le tableau
                    tableBody.innerHTML = '';
                    rows.forEach(row => tableBody.appendChild(row));
                    break;

                case 'scoreboard-players':
                    const playerTableBody = document.querySelector('#game-sessions-table tbody');
                    const playerRows = Array.from(playerTableBody.querySelectorAll('tr'));

                    playerRows.sort((a, b) => {
                        const timeA = parseFloat(a.lastElementChild.textContent.split('heure')[0]);
                        const timeB = parseFloat(b.lastElementChild.textContent.split('heure')[0]);
                        return currentSortOrder === 'desc' ? timeB - timeA : timeA - timeB;
                    });

                    playerTableBody.innerHTML = '';
                    playerRows.forEach(row => playerTableBody.appendChild(row));
                    break;

                case 'scoreboard-games':
                    const gameTableBody = document.querySelector('#game-sessions-table tbody');
                    const gameRows = Array.from(gameTableBody.querySelectorAll('tr'));

                    gameRows.sort((a, b) => {
                        const timeA = parseFloat(a.lastElementChild.textContent.split('heure')[0]);
                        const timeB = parseFloat(b.lastElementChild.textContent.split('heure')[0]);
                        return currentSortOrder === 'desc' ? timeB - timeA : timeA - timeB;
                    });

                    gameTableBody.innerHTML = '';
                    gameRows.forEach(row => gameTableBody.appendChild(row));
                    break;
            }
        });

        // Gestion du clic sur Scoreboard Jeux
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

        // Gestion du clic sur les jeux dans la sidebar
        document.getElementById('game-list-items').addEventListener('click', (event) => {
            if (event.target.tagName === 'BUTTON') {
                const gameName = event.target.dataset.game;
                const filteredData = sortedData.filter(entry => entry.game_name === gameName);
                displayData(filteredData);
            }
        });

        // Gestion de la recherche
        document.getElementById('search-box').addEventListener('input', (event) => {
            const searchTerm = event.target.value.toLowerCase();
            const buttons = document.querySelectorAll('#game-list-items button');
            buttons.forEach(button => {
                const gameName = button.textContent.toLowerCase();
                button.style.display = gameName.includes(searchTerm) ? 'block' : 'none';
            });
        });

    })
    .catch(error => console.error('Erreur:', error));

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
                // Tableau des sessions totales
                gameText = columns[0].textContent.toLowerCase(); // Nom du jeu
                playerText = columns[1].textContent.toLowerCase(); // Nom du joueur
            } else if (columns.length === 2) {
                // Tableau du scoreboard joueurs ou jeux
                const headerText = document.querySelector('#game-sessions-table thead th').textContent;
                if (headerText.includes('joueur')) {
                    // Scoreboard joueurs
                    playerText = columns[0].textContent.toLowerCase().split('-')[1]?.trim() || '';
                } else {
                    // Scoreboard jeux
                    gameText = columns[0].textContent.toLowerCase();
                }
            }

            // Afficher la ligne seulement si elle correspond aux deux critères de recherche
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


// Fonction pour convertir les minutes en heures et minutes
function convertMinutesToHours(minutes) {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours} heure${hours !== 1 ? 's' : ''} ${remainingMinutes} min`;
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

// Gérer le chargement initial
window.addEventListener('load', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const category = urlParams.get('category') || 'total'; // Par défaut, 'total'
    highlightActiveButton('scoreboard-total');


    switch (category) {
        case 'players':
            const playerData = calculatePlayerData(sortedData); // Calcule les données des joueurs
            displayPlayerData(playerData); // Affiche les données des joueurs
            break;
        case 'games':
            const gameData = calculateGameData(sortedData); // Calcule les données des jeux
            displayGameData(gameData); // Affiche les données des jeux
            break;
        case 'total':
        default:
            displayData(sortedData); // Affiche les données globales par défaut
            break;
    }
});


// Fonction pour générer la liste des jeux dans la sidebar
function generateSidebar(gameNames, gameTotalDurations) {
    const gameList = document.getElementById('game-list-items');

    const sortedGameNames = gameNames.sort((a, b) => (gameTotalDurations[b] || 0) - (gameTotalDurations[a] || 0));

    for (const gameName of sortedGameNames) {
        const button = document.createElement('button');
        const totalDuration = gameTotalDurations[gameName] || 0;
        const formattedDuration = convertMinutesToHours(totalDuration);
        button.textContent = `${gameName} - ${formattedDuration} au total`;
        button.dataset.game = gameName;

        gameList.appendChild(button);
    }
}

// Afficher les données dans le tableau des sessions de jeu
function displayData(data) {
    const tableBody = document.querySelector('#game-sessions-table tbody');
    tableBody.innerHTML = ''; // Réinitialiser le corps du tableau avant de l'afficher à nouveau

    const sortOrder = document.getElementById('sort-time').getAttribute('data-order');
    const sortedData = sortDataByTime(data, sortOrder);

    for (const entry of data) {
        const row = document.createElement('tr');

        // Nom du jeu
        const gameNameCell = document.createElement('td');
        gameNameCell.textContent = entry.game_name;

        // Nom du joueur avec lien vers Instagram
        const userNameCell = document.createElement('td');
        const userLink = document.createElement('a');
        userLink.href = `https://instagram.com/${entry.user_name}`;
        userLink.textContent = entry.user_name;
        userLink.target = '_blank';
        userNameCell.appendChild(userLink);

        // Durée totale
        const totalDurationCell = document.createElement('td');
        totalDurationCell.textContent = convertMinutesToHours(entry.total_duration);

        // Ajouter les cellules au tableau
        row.appendChild(gameNameCell);
        row.appendChild(userNameCell);
        row.appendChild(totalDurationCell);
        tableBody.appendChild(row);
    }

    // Réinitialiser l'en-tête pour les trois colonnes
    const tableHeader = document.querySelector('#game-sessions-table thead');
    tableHeader.innerHTML = `
        <tr>
            <th>Nom du jeu</th>
            <th>Nom du joueur</th>
            <th>Durée totale</th>
        </tr>
    `;

    document.getElementById('game-sessions-container').style.display = 'block';
    document.getElementById('players-sessions-container').style.display = 'none';
}

// Fonction pour afficher les données des joueurs dans le tableau
function displayPlayerData(data) {
    const tableBody = document.querySelector('#game-sessions-table tbody');
    tableBody.innerHTML = '';

    const sortOrder = document.getElementById('sort-time').getAttribute('data-order');
    const sortedData = sortDataByTime(data, sortOrder);

    data.forEach((entry, index) => {
        const row = document.createElement('tr');



        // Appliquer le style pour les 3 premiers joueurs
        if (index === 0) {
            row.style.backgroundColor = '#877619'; // Or
            row.style.color = '#000'; // Texte noir
            row.style.fontWeight = 'bold'; // Texte en gras
        } else if (index === 1) {
            row.style.backgroundColor = '#9a9898'; // Argent
            row.style.color = '#000'; // Texte noir
            row.style.fontWeight = 'bold'; // Texte en gras
        } else if (index === 2) {
            row.style.backgroundColor = '#93500d'; // Bronze
            row.style.color = '#000'; // Texte noir
            row.style.fontWeight = 'bold'; // Texte en gras
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
            <th>Nom du joueur</th>
            <th>Durée totale</th>
        </tr>
    `;

    document.getElementById('game-sessions-container').style.display = 'block';
    document.getElementById('players-sessions-container').style.display = 'none';
}

// Fonction pour afficher les données des jeux dans le tableau
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

    // Masquer les colonnes inutilisées pour les jeux
    const tableHeader = document.querySelector('#game-sessions-table thead');
    tableHeader.innerHTML = `
        <tr>
            <th>Nom du jeu</th>
            <th>Temps total</th>
        </tr>
    `;

    document.getElementById('game-sessions-container').style.display = 'block';
    document.getElementById('players-sessions-container').style.display = 'none';
}