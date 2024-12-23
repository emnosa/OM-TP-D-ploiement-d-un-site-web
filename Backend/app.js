require('dotenv').config();  // Charge le fichier .env

const express = require('express');
const mysql = require('mysql2');
const ModbusRTU = require("modbus-serial");
const cors = require('cors');  // Importer le package CORS
const app = express();

const dbConfig = {
    host: "db", // Utilisez le nom du service défini dans docker-compose
    user: "root",
    password: "root",
    database: "hackathon"
};

// Connexion à la base de données avec mysql2
const connection = mysql.createConnection(dbConfig);

// Vérification de la connexion à la base de données
connection.connect((err) => {
    if (err) {
        console.error('Erreur de connexion à la base de données:', err.stack);
        return;
    }
    console.log('Connexion à la base de données réussie');
});

// Connexion Modbus TCP
const client = new ModbusRTU();
const modbusHost = "172.16.1.23"; // Adresse IP de l'automate
const modbusPort = 502; // Port Modbus TCP

client.connectTCP(modbusHost, { port: modbusPort }, () => {
    console.log('Connexion Modbus TCP réussie');
});

// Activer CORS pour toutes les requêtes (ou spécifier des origines spécifiques)
app.use(cors());  // Active CORS

// Middleware pour gérer les requêtes POST avec JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Fonction pour lire les données via Modbus et insérer dans la base de données
const readAndInsertData = () => {
    client.readCoils(600, 25, function(err, data) {
        if (err) {
            console.error('Erreur lors de la lecture Modbus:', err);
            return;
        }

        // Insertion ou remplacement des données dans la base de données avec REPLACE INTO
        for (let i = 0; i < data.data.length; i++) {
            const variable_name = `variable_${600 + i}`;
            const value = data.data[i];

            // Utilisation de REPLACE INTO pour remplacer les anciennes données si elles existent
            const query = `
                REPLACE INTO \`read-data\` (automate_id, variable_address, value, status)
                VALUES (?, ?, ?, ?);
            `;
            connection.query(query, [1, 600 + i, value, 'OK'], (err, result) => {
                if (err) {
                    console.error('Erreur lors de l\'insertion dans la base de données:', err);
                }
            });
        }
    });
};



// Effectuer la tâche toutes les secondes
setInterval(readAndInsertData, 1000);  // Exécute la fonction toutes les 1000ms (1 seconde)

// Route GET pour récupérer les données
app.get('/get-data', (req, res) => {
    const query = 'SELECT * FROM `read-data` ORDER BY timestamp DESC LIMIT 10';
    connection.query(query, (err, results) => {
        if (err) {
            console.error('Erreur lors de la récupération des données:', err);
            return res.status(500).json({ error: 'Erreur lors de la récupération des données' });
        }
        res.status(200).json({ data: results });
    });
});

// Route GET pour récupérer les données historiques depuis la table `read-data`
app.get('/get-history', (req, res) => {
    const query = 'SELECT * FROM `read-data` ORDER BY timestamp DESC LIMIT 100';  // Sélectionner les dernières 100 entrées
    connection.query(query, (err, results) => {
        if (err) {
            console.error('Erreur lors de la récupération des données historiques:', err);
            return res.status(500).json({ error: 'Erreur lors de la récupération des données' });
        }
        res.status(200).json({ data: results });
    });
});


// Route pour tester la connexion
app.get('/', (req, res) => {
    res.send('L\'application backend est en fonctionnement');
});

const PORT = 4000;
app.listen(PORT, () => {
    console.log(`Serveur démarré sur le port ${PORT}`);
});
