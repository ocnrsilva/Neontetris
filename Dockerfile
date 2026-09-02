# -------------------------------------------------------------
# Stage 1: Build stage with Node.js
# -------------------------------------------------------------
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package descriptors first to take advantage of layer caching
COPY package.json package-lock.json* bun.lock* ./

# Install dependencies
RUN npm install

# Copy application source code
COPY . .

# Build production static assets
RUN npm run build

# -------------------------------------------------------------
# Stage 2: Production Nginx Server
# -------------------------------------------------------------
FROM nginx:alpine

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy build artifacts from previous stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose internal HTTP port
EXPOSE 80

# Start Nginx in foreground
CMD ["nginx", "-g", "daemon off;"]
