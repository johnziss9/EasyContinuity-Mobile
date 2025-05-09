# Use Node 20.15.0 as the base image
FROM node:20.15.0

# Set up working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install app dependencies and update expo-cli
RUN npm install --legacy-peer-deps && npm install -g expo-cli@latest

# Copy app files
COPY . .

# Update expo SDK
RUN npx expo install --fix -- --legacy-peer-deps

# Expose port 8081 for Metro bundler
EXPOSE 8081

# Expose port 19000 for Expo
EXPOSE 19000

# Expose port 19002 for Expo DevTools
EXPOSE 19002

# Start the app - This can be overridden by docker-compose
CMD ["npx", "expo", "start", "--web"]