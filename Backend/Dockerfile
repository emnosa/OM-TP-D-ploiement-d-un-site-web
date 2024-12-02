FROM node:latest
WORKDIR /app

# Copie les fichiers de package pour installer les dépendances
COPY package*.json ./
RUN npm install

# Copie tout le code source
COPY . .

# Installe nodemon pour le développement
RUN npm install -g nodemon

# Expose le port 5000
EXPOSE 5000

# Commande pour démarrer l'application
CMD ["nodemon","--legacy-watch", "app.js"]
