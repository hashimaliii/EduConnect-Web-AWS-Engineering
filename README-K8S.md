# ☸️ Kubernetes Deployment (Minikube)

This guide deploys EduConnect on a local Kubernetes cluster using Minikube. The setup includes a MongoDB replica set with persistent storage, HPA autoscaling, and LoadBalancer services exposed via `minikube tunnel`.

---

## 📋 Prerequisites

- [Minikube](https://minikube.sigs.k8s.io/) installed
- [kubectl](https://kubernetes.io/docs/tasks/tools/) installed
- Docker Desktop running
- Images pushed to Docker Hub:
  - `hashimaliii/server:v1.0`
  - `hashimaliii/client:v3.0`

---

## 🗂️ Manifest Files

| File             | Purpose                                                   |
|------------------|-----------------------------------------------------------|
| `pv.yaml`        | 3 PersistentVolumes (hostPath) for MongoDB pods           |
| `secret.yaml`    | Kubernetes Secret holding the JWT key                     |
| `mongo-ss.yaml`  | MongoDB StatefulSet (3 replicas) + Headless Service       |
| `server.yaml`    | Backend Deployment (3 replicas) + LoadBalancer Service    |
| `client.yaml`    | Frontend Deployment (3 replicas) + LoadBalancer Service   |
| `hpa.yaml`       | HorizontalPodAutoscalers for client and server            |

---

## 🚀 Deployment Steps

### Step 1 — Start Minikube

```bash
minikube start
minikube addons enable metrics-server
```

> `metrics-server` is required for HPA to read CPU metrics. Without it, HPA shows `<unknown>` and cannot scale.

Verify the storage class exists:
```bash
kubectl get sc
# Should show: standard (default)   k8s.io/minikube-hostpath
```

---

### Step 2 — Apply All Manifests in Order

```bash
kubectl apply -f infra/pv.yaml
kubectl apply -f infra/secret.yaml
kubectl apply -f infra/mongo-ss.yaml
kubectl apply -f infra/server.yaml
kubectl apply -f infra/client.yaml
kubectl apply -f infra/hpa.yaml
```

---

### Step 3 — Wait for Pods to be Running

```bash
kubectl get pods -w
```

Expected output:
```
NAME                      READY   STATUS    RESTARTS   AGE
client-xxxx-xxxx          1/1     Running   0          30s
client-xxxx-xxxx          1/1     Running   0          30s
client-xxxx-xxxx          1/1     Running   0          30s
mongo-0                   1/1     Running   0          60s
mongo-1                   1/1     Running   0          50s
mongo-2                   1/1     Running   0          40s
server-xxxx-xxxx          1/1     Running   0          30s
server-xxxx-xxxx          1/1     Running   0          30s
server-xxxx-xxxx          1/1     Running   0          30s
```

---

### Step 4 — Initialize the MongoDB Replica Set ⚠️ (Required Once)

Kubernetes starts the pods but MongoDB must be manually told to form a replica set. Run this **once** after all mongo pods are Running:

```bash
kubectl exec -it mongo-0 -- mongosh --eval "rs.initiate({
  _id: 'rs0',
  members: [
    { _id: 0, host: 'mongo-0.mongo:27017' },
    { _id: 1, host: 'mongo-1.mongo:27017' },
    { _id: 2, host: 'mongo-2.mongo:27017' }
  ]
})"
```

Verify the replica set is healthy:
```bash
kubectl exec -it mongo-0 -- mongosh --eval "rs.status()"
```

You should see **1 PRIMARY** and **2 SECONDARY** members. If you see `already initialized`, the replica set is already running — proceed to the next step.

---

### Step 5 — Expose Services via Tunnel (Windows / Docker Driver)

On Windows with the Docker driver, `minikube tunnel` is required to assign `EXTERNAL-IP` to LoadBalancer services.

Open a **separate Administrator PowerShell** and keep it running for the duration of your session:

```powershell
minikube tunnel
```

In your original terminal, confirm EXTERNAL-IP is assigned:
```bash
kubectl get services
# server-svc and client-svc should both show EXTERNAL-IP: 127.0.0.1
```

---

### Step 6 — Build Client Image with Correct Backend URL

> The `VITE_API_URL` is baked into the JS bundle at **build time**. The backend is exposed at `127.0.0.1:5000` via the tunnel.

```bash
cd client
docker build --build-arg VITE_API_URL=http://127.0.0.1:5000 -t hashimaliii/client:v3.0 .
docker push hashimaliii/client:v3.0
cd ..
kubectl apply -f infra/client.yaml
```

---

### Step 7 — Access the App

```bash
minikube service client-svc --url
```

Open the URL in your browser. The backend is accessible at `http://127.0.0.1:5000`.

---

## 📈 Autoscaling (HPA)

HPA is configured for both `client` and `server` deployments:

| Setting         | Value |
|-----------------|-------|
| Minimum Pods    | 2     |
| Maximum Pods    | 5     |
| CPU Target      | 70%   |

Check HPA status:
```bash
kubectl get hpa
```

Expected output:
```
NAME         REFERENCE           TARGETS       MINPODS   MAXPODS   REPLICAS
client-hpa   Deployment/client   cpu: 0%/70%   2         5         2
server-hpa   Deployment/server   cpu: 0%/70%   2         5         2
```

> If `server-hpa` shows `<unknown>/70%`, run `kubectl rollout restart deployment/server` to recreate pods with the correct resource requests.

---

## 💾 Persistent Storage

Each MongoDB pod has its own 1Gi PersistentVolumeClaim:

| PVC                    | Bound To   | Size |
|------------------------|------------|------|
| mongo-volume-mongo-0   | mongo-pv-0 | 1Gi  |
| mongo-volume-mongo-1   | mongo-pv-1 | 1Gi  |
| mongo-volume-mongo-2   | mongo-pv-2 | 1Gi  |

```bash
kubectl get pv
kubectl get pvc
```

> PVCs are **not deleted** when you delete the StatefulSet. Delete them manually for a clean slate:
> ```bash
> kubectl delete pvc mongo-volume-mongo-0 mongo-volume-mongo-1 mongo-volume-mongo-2
> ```

---

## 🛠️ Debugging Commands

```bash
# All pods and their status
kubectl get pods

# All services with external IPs
kubectl get services

# Persistent volumes and claims
kubectl get pv && kubectl get pvc

# HPA status
kubectl get hpa

# Server logs (live)
kubectl logs deployment/server --follow

# Describe a pod for detailed events/errors
kubectl describe pod <pod-name>

# MongoDB replica set status
kubectl exec -it mongo-0 -- mongosh --eval "rs.status()"

# Drop into a MongoDB shell
kubectl exec -it mongo-0 -- mongosh

# Force restart a deployment (picks up new config)
kubectl rollout restart deployment/server
kubectl rollout restart deployment/client
```

---

## 🔑 Key Differences vs. Docker Compose

| Concern      | Docker Compose                    | Kubernetes                                       |
|--------------|-----------------------------------|--------------------------------------------------|
| Persistence  | Single named volume (`mongodb`)   | 3 separate PVCs (one per StatefulSet pod)        |
| Networking   | Service name (`mongodb`)          | Headless Service DNS (`mongo-0.mongo`)           |
| Scaling      | Manual (`--scale`)                | Declarative via HPA (auto min 2 → max 5)         |
| DB Init      | Automatic on first run            | Manual `rs.initiate()` required once             |
| Secrets      | `.env` files                      | Kubernetes Secret objects                        |
| Frontend URL | `localhost:5173` (Vite dev)       | `minikube tunnel` + nginx on port 80             |

---

## 🧹 Teardown

```bash
# Delete all resources
kubectl delete -f infra/

# Delete PVCs manually (StatefulSet PVCs are not auto-deleted)
kubectl delete pvc mongo-volume-mongo-0 mongo-volume-mongo-1 mongo-volume-mongo-2

# Stop minikube
minikube stop
```