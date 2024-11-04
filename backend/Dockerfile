# Dockerfile for Node.js Backend
FROM node:alpine

WORKDIR /app

# Install app dependencies
COPY package*.json ./
RUN npm install

# Bundle app source
COPY . .

# Expose the API port (adjust if needed)
EXPOSE 5000

# Start the application
CMD ["node", "server.js"]
