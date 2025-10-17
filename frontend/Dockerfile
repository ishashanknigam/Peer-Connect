# Use official Node.js LTS image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install ALL dependencies (needed for build)
RUN npm install

# Copy the rest of the frontend code
COPY . .


# Build the frontend
RUN npm run build

# Expose frontend port
EXPOSE 4173

CMD ["npm", "run", "preview", "--", "--host", "0.0.0.0", "--port", "4173"]
