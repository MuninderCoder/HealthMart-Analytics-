# Stage 1: Build the React application
FROM node:20-alpine AS build

WORKDIR /app

# Copy package descriptors and install dependencies
COPY frontend/package*.json ./
RUN npm ci

# Copy all frontend files and compile production build
COPY frontend/ ./
RUN npm run build

# Stage 2: Serve using Nginx
FROM nginx:alpine

# Copy built assets to default nginx folder
COPY --from=build /app/dist /usr/share/nginx/html

# Copy custom Nginx configuration for proxy routing
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
