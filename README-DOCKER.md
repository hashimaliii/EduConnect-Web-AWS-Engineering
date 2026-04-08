# 🐳 Docker & Docker Compose Setup

This guide covers building the Docker images and running all three services locally using Docker Compose.

---

## 📋 Prerequisites

- Docker Desktop installed and running
- Docker Hub account (if pushing images)

---

## 🏗️ Docker Images

### Server Image

The server uses a Node.js Alpine image in production mode. It installs only production dependencies and runs as a non-root user for security.

```bash
cd server
docker build -t hashimaliii/server:v1.0 .
docker push hashimaliii/server:v1.0
```

**`server/Dockerfile`:**
```dockerfile
FROM node:lts-alpine
ENV NODE_ENV=production
WORKDIR /usr/src/app
COPY ["package.json", "package-lock.json*", "./"]
RUN npm install --production --silent && mv node_modules ../
COPY . .
EXPOSE 5000
RUN chown -R node /usr/src/app
USER node
CMD ["npm", "start"]
```

---

### Client Image

The client uses a **multi-stage build**. Stage 1 compiles the React app with Vite, Stage 2 serves the static output via nginx.

> ⚠️ **Important:** `VITE_API_URL` is baked into the JS bundle at build time (not a runtime env var). Pass it as a `--build-arg` when building.

```bash
cd client
docker build --build-arg VITE_API_URL=http://localhost:5000 -t hashimaliii/client:v3.0 .
docker push hashimaliii/client:v3.0
```

**`client/Dockerfile`:**
```dockerfile
# Stage 1: Build
FROM node:lts-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL
RUN npm run build

# Stage 2: Serve with nginx
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
RUN echo 'server { \
  listen 80; \
  root /usr/share/nginx/html; \
  index index.html; \
  location / { try_files $uri $uri/ /index.html; } \
}' > /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

---

## 🚀 Running with Docker Compose

### 1. Create the External MongoDB Volume (once)

```bash
docker volume create mongodb
```

### 2. Configure Environment Variables

**`server/.env`:**
```env
MONGO_URI=mongodb://mongodb:27017/educonnect
PORT=5000
JWT_SECRET=supersecretkey123
```

**`client/.env`:**
```env
VITE_API_URL=http://localhost:5000
```

### 3. Start All Services

```bash
docker compose up -d
```

### 4. Access the Application

| Service     | URL                    |
|-------------|------------------------|
| Frontend    | http://localhost:5173  |
| Backend API | http://localhost:5000  |
| MongoDB     | localhost:27017        |

---

## 🔄 Services Overview

| Service | Image                         | Port  |
|---------|-------------------------------|-------|
| MongoDB | `mongodb-community-server`    | 27017 |
| Server  | `hashimaliii/server:v1.0`     | 5000  |
| Client  | `hashimaliii/client:v3.0`     | 80    |

---

## 🛑 Stopping the Stack

```bash
# Stop containers (preserves volumes)
docker compose down

# Stop and remove volumes (destructive — deletes all MongoDB data)
docker compose down -v
```

---

## 🛠️ Useful Commands

```bash
# View running containers
docker ps

# Follow logs for a specific service
docker compose logs -f server
docker compose logs -f client

# Access MongoDB shell
docker exec -it mongodb mongosh

# Rebuild a single service
docker compose up --build server

# Inspect the MongoDB volume
docker volume inspect mongodb
```

---

## 📁 Volume

MongoDB data is persisted using an **external named volume** (`mongodb`). This volume must be created manually before running the stack. It survives `docker compose down` but is removed by `docker compose down -v`.