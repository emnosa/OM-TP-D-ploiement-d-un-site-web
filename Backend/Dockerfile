FROM node:latest
WORKDIR /app
COPY package*.json ./
RUN npm install -g nodemon
COPY . .
EXPOSE 5000
CMD ["nodemon", "app.js"]