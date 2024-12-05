FROM node:latest

# Mettre à jour les sources et installer mariadb-client ou mysql-client
RUN apt-get update && apt-get install -y mariadb-client

WORKDIR /app

# Copie les fichiers de package pour installer les dépendances
COPY package*.json ./
RUN npm install

# Copie tout le code source
COPY . .

# Installe nodemon pour le développement
RUN npm install -g nodemon

# Expose le port 3000
EXPOSE 3000

# Commande pour démarrer l'application
CMD ["nodemon", "--legacy-watch", "app.js"]
