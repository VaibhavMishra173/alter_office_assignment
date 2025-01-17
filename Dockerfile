FROM node:alpine

# Install dependencies
RUN apk add --no-cache bash curl netcat-openbsd

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install Node.js dependencies
RUN npm install

# Copy the rest of the application
COPY . .

# Expose application port
EXPOSE 3000

# Default command
CMD ["npm", "run", "dev"]
