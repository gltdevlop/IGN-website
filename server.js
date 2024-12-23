const express = require('express');
const mysql = require('mysql2');
const app = express();
const port = 3000;

// Créez une connexion à la base de données MySQL
const db = mysql.createConnection({
    host: 'mysql.edl360.fr',
    user: 'root',
    password: 'gabriel123',
    database: 'game_sessions_db'  // Remplacez par le nom de votre base de données
});

// Vérifier la connexion à la base de données
db.connect((err) => {
    if (err) {
        console.error('Erreur de connexion à la base de données:', err);
    } else {
        console.log('Connecté à la base de données MySQL');
    }
});

// Middleware pour servir les fichiers statiques (HTML, CSS, JS)
app.use(express.static('public'));

// Route principale pour servir la page HTML
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

// Route API pour récupérer les données de la table `game_sessions`
app.get('/api/game_sessions', (req, res) => {
    const query = 'SELECT game_name, user_name, duration_minutes FROM game_sessions';
    db.query(query, (err, results) => {
        if (err) {
            console.error('Erreur de requête SQL:', err);
            res.status(500).send('Erreur serveur');
        } else {
            res.json(results); // Retourne uniquement les colonnes spécifiées
        }
    });
});


app.listen(port, () => {
    console.log(`Serveur lancé sur http://localhost:${port}`);
});
