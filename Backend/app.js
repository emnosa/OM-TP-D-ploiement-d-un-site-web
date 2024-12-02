const express = require('express');
const mysql = require('mysql2');
const ModbusRTU = require("modbus-serial");  // Module pour la connexion Modbus
const app = express();

// Configuration de la connexion à la base de données
const dbConfig = {
    host: 'om-tp-d-ploiement-d-un-site-web-db-1',  // Nom du conteneur DB dans Docker
    user: 'root',  // Utilisateur de la base de données
    password: 'root',  // Mot de passe (vide si aucun)
    database: 'hackathon',  // Nom de la base de données
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

// Connexion Modbus (remplacez les paramètres par ceux de votre automate)
const client = new ModbusRTU();
const modbusHost = "172.16.1.23";  // IP de l'automate Modbus
const modbusPort = 502;  // Port par défaut Modbus

client.connectTCP(modbusHost, { port: modbusPort }, () => {
    console.log('Connexion Modbus réussie');
});

// Middleware pour gérer les requêtes POST avec JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Exemple de route POST pour insérer des données dans la base de données
app.post('/read-data', (req, res) => {
    // Lecture des données de l'automate via Modbus
    client.readInputRegisters(0, 2, function(err, data) {
        if (err) {
            console.error('Erreur lors de la lecture Modbus:', err);
            return res.status(500).json({ error: 'Erreur de lecture Modbus' });
        }
        
        // Exemple d'enregistrement des données de l'automate dans la base de données
        const variable_name = "temperature";  // Exemple de variable (vous pouvez adapter selon vos besoins)
        const value = data.data[0];  // Valeur du premier registre lu

        // Insertion dans la base de données
        const query = 'INSERT INTO automate_data (variable_name, value) VALUES (?, ?)';
        connection.query(query, [variable_name, value], (err, result) => {
            if (err) {
                console.error('Erreur lors de l\'insertion des données dans la base de données:', err);
                return res.status(500).json({ error: 'Erreur lors de l\'insertion dans la base de données' });
            }
            res.status(200).json({ message: 'Données insérées avec succès', result: result });
        });
    });
});

// Exemple de route GET pour récupérer les données de la base de données
app.get('/get-data', (req, res) => {
    // Requête pour récupérer les 10 dernières données de la table automate_data
    const query = 'SELECT * FROM automate_data ORDER BY timestamp DESC LIMIT 10';
    connection.query(query, (err, results) => {
        if (err) {
            console.error('Erreur lors de la récupération des données:', err);
            return res.status(500).json({ error: 'Erreur lors de la récupération des données' });
        }
        res.status(200).json({ data: results });
    });
});

// Route pour tester la connexion
app.get('/', (req, res) => {
    res.send('L\'application backend est en fonctionnement');
});

// Démarrage du serveur
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Serveur démarré sur le port ${PORT}`);
});
