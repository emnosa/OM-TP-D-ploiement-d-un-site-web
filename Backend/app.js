// Importation des modules nécessaires
const express = require('express'); // Framework web Express
const mysql = require('mysql2'); // Module mysql2 pour interagir avec MariaDB
const bodyParser = require('body-parser'); // Middleware pour analyser le corps des requêtes HTTP
const cors = require('cors'); // Middleware pour gérer les CORS

// Création de l'application Express
const app = express();

// Configuration du port sur lequel le serveur va écouter
const PORT = process.env.PORT || 3000;

// Middleware pour gérer les CORS
app.use(cors());

// Middleware pour analyser le corps des requêtes en JSON
app.use(bodyParser.json());

// Connexion à la base de données MariaDB
const db = mysql.createConnection({
    host: 'localhost',        // Adresse de l'hôte de la base de données
    user: 'root',             // Nom d'utilisateur de la base de données
    password: 'password',     // Mot de passe de la base de données
    database: 'monapp'        // Nom de la base de données
});

// Vérification de la connexion
db.connect((err) => {
    if (err) {
        console.error('Erreur de connexion à la base de données:', err);
        return;
    }
    console.log('Connexion à la base de données MariaDB réussie');
});

// Route de test (accès à la racine)
app.get('/', (req, res) => {
    res.send('Bienvenue sur l\'API de notre site web avec MariaDB!');
});

// Exemple de route API pour récupérer des données depuis la base de données
app.get('/api/articles', (req, res) => {
    const query = 'SELECT * FROM articles'; // Requête SQL pour récupérer tous les articles
    db.query(query, (err, results) => {
        if (err) {
            console.error('Erreur lors de la récupération des articles:', err);
            return res.status(500).json({ message: 'Erreur serveur', error: err });
        }
        res.json(results); // Renvoi des résultats sous forme de JSON
    });
});

// Exemple de route API pour ajouter un nouvel article
app.post('/api/articles', (req, res) => {
    const { title, content } = req.body; // Récupère le titre et le contenu de la requête
    const query = 'INSERT INTO articles (title, content) VALUES (?, ?)'; // Requête SQL pour insérer un nouvel article

    db.query(query, [title, content], (err, results) => {
        if (err) {
            console.error('Erreur lors de l\'ajout de l\'article:', err);
            return res.status(400).json({ message: 'Erreur lors de l\'ajout de l\'article', error: err });
        }
        res.status(201).json({
            id: results.insertId, // ID généré pour le nouvel article
            title,
            content,
            createdAt: new Date()
        });
    });
});

// Exemple de route API pour mettre à jour un article
app.put('/api/articles/:id', (req, res) => {
    const { id } = req.params;
    const { title, content } = req.body;
    const query = 'UPDATE articles SET title = ?, content = ? WHERE id = ?';

    db.query(query, [title, content, id], (err, results) => {
        if (err) {
            console.error('Erreur lors de la mise à jour de l\'article:', err);
            return res.status(400).json({ message: 'Erreur lors de la mise à jour de l\'article', error: err });
        }
        if (results.affectedRows === 0) {
            return res.status(404).json({ message: 'Article non trouvé' });
        }
        res.json({ message: 'Article mis à jour' });
    });
});

// Exemple de route API pour supprimer un article
app.delete('/api/articles/:id', (req, res) => {
    const { id } = req.params;
    const query = 'DELETE FROM articles WHERE id = ?';

    db.query(query, [id], (err, results) => {
        if (err) {
            co
