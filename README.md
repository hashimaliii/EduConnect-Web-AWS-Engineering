# 🎓 EduConnect Pakistan – MERN Stack Tutoring Platform

**EduConnect Pakistan** is a full-featured online tutoring and session management platform built using the **MERN stack**. It supports three user roles — Student, Tutor, and Admin — with dedicated dashboards, session management, verification workflows, and earnings tracking.

---

## 🔗 Tech Stack

| Layer           | Technology                              |
|-----------------|-----------------------------------------|
| Frontend        | React 19 + Vite 8, Axios, React Router  |
| Backend         | Node.js + Express.js + Nodemon          |
| Database        | MongoDB 6.0 (Replica Set)               |
| Auth            | JWT (JSON Web Tokens)                   |
| Containerization| Docker (multi-stage builds)             |
| Orchestration   | Kubernetes (Minikube)                   |
| Image Registry  | Docker Hub (`hashimaliii`)              |

---

## 📦 Project Structure

```
EduConnect-Web-Engineering/
├── client/                  # React + Vite frontend
│   ├── Dockerfile           # Multi-stage: Node build → nginx serve
│   ├── .env                 # VITE_API_URL (baked at build time)
│   └── src/
│       ├── pages/
│       │   ├── auth/        # Login, Signup
│       │   ├── student/     # TutorSearch, MySessions, Wishlist, Notifications
│       │   ├── tutor/       # Dashboard, Sessions, Earnings, Profile, Verification
│       │   └── admin/       # Dashboard, Users, Reports, Verification
│       └── components/
├── server/                  # Express REST API
│   ├── Dockerfile           # Node.js production image
│   ├── server.js
│   ├── routes/
│   ├── controllers/
│   ├── models/
│   └── middleware/
├── infra/                   # Kubernetes manifests
│   ├── pv.yaml
│   ├── secret.yaml
│   ├── mongo-ss.yaml
│   ├── server.yaml
│   ├── client.yaml
│   └── hpa.yaml
├── compose.yaml             # Docker Compose (local dev)
├── README-DOCKER.md         # Docker & Compose guide
└── README-K8S.md            # Kubernetes deployment guide
```

---

## 👥 User Roles & Capabilities

### 👨‍🎓 Students
- Browse and filter tutors (subject, city, availability, rating)
- Book, reschedule, and cancel sessions
- Add tutors to wishlist
- Rate and review tutors
- Receive notifications

### 👨‍🏫 Tutors
- Manage profile, bio, availability, and hourly rate
- Accept, decline, and complete booked sessions
- Track earnings
- Submit documents for admin verification

### 🛡️ Admins
- Approve or reject tutor verification requests
- View and manage all user accounts
- Access platform analytics and reports
- Monitor session trends, subject popularity, and city-wise growth

---

## ⚙️ Local Development Setup

### Backend

```bash
cd server
npm install
# Ensure server/.env contains:
# MONGO_URI=mongodb://localhost:27017/educonnect
# PORT=5000
# JWT_SECRET=supersecretkey123
npm run dev
```

### Frontend

```bash
cd client
npm install
# Ensure client/.env contains:
# VITE_API_URL=http://localhost:5000
npm run dev
```

Frontend runs at `http://localhost:5173`, backend at `http://localhost:5000`.

---

## 🐳 Docker & Docker Compose

See **[README-DOCKER.md](./README-DOCKER.md)** for:
- Building Docker images (server + client)
- Running locally with Docker Compose
- Environment variable configuration

**Quick start:**
```bash
docker volume create mongodb
docker compose up -d
```

| Service     | URL                   |
|-------------|-----------------------|
| Frontend    | http://localhost:5173 |
| Backend API | http://localhost:5000 |

---

## ☸️ Kubernetes Deployment

See **[README-K8S.md](./README-K8S.md)** for the full guide including HPA, persistent storage, and Windows/Docker driver specifics.

**Quick start:**
```bash
minikube start
minikube addons enable metrics-server
kubectl apply -f infra/pv.yaml
kubectl apply -f infra/secret.yaml
kubectl apply -f infra/mongo-ss.yaml
kubectl apply -f infra/server.yaml
kubectl apply -f infra/client.yaml
kubectl apply -f infra/hpa.yaml
```

Then initialize the MongoDB replica set:
```bash
kubectl exec -it mongo-0 -- mongosh --eval "rs.initiate({ _id: 'rs0', members: [{ _id: 0, host: 'mongo-0.mongo:27017' }, { _id: 1, host: 'mongo-1.mongo:27017' }, { _id: 2, host: 'mongo-2.mongo:27017' }] })"
```

### Deployment Summary

| Resource         | Count | Details                              |
|------------------|-------|--------------------------------------|
| Frontend pods    | 3     | nginx serving React SPA              |
| Backend pods     | 3     | Express API                          |
| MongoDB pods     | 3     | Replica set (1 PRIMARY, 2 SECONDARY) |
| PersistentVolume | 3     | 1Gi each for MongoDB                 |
| HPA              | 2     | min 2 / max 5 pods at 70% CPU        |

---

## 🧪 Docker Images

| Image                      | Description              |
|----------------------------|--------------------------|
| `hashimaliii/server:v1.0`  | Node.js backend          |
| `hashimaliii/client:v3.0`  | nginx + React production build |

---

## 🧾 License

Built as part of a university **Web Engineering** course (6th Semester) — for academic use.