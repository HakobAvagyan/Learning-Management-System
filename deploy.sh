#!/bin/bash
set -e

REPO_URL="https://github.com/HakobAvagyan/Learning-Management-System.git"
APP_DIR="/opt/lms"

echo "=== [1/5] Installing Docker & Docker Compose ==="
if ! command -v docker &>/dev/null; then
    apt-get update -y
    apt-get install -y ca-certificates curl gnupg lsb-release
    install -m 0755 -d /etc/apt/keyrings
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
    chmod a+r /etc/apt/keyrings/docker.gpg
    echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] \
        https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "$VERSION_CODENAME") stable" \
        > /etc/apt/sources.list.d/docker.list
    apt-get update -y
    apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
    systemctl enable --now docker
    echo "Docker installed."
else
    echo "Docker already installed: $(docker --version)"
fi

echo "=== [2/5] Cloning / updating repository ==="
if [ -d "$APP_DIR/.git" ]; then
    cd "$APP_DIR"
    git fetch origin
    git reset --hard origin/master
    echo "Repository updated."
else
    git clone "$REPO_URL" "$APP_DIR"
    cd "$APP_DIR"
    echo "Repository cloned."
fi

echo "=== [3/5] Tuning system limits (Kafka needs this) ==="
sysctl -w vm.max_map_count=262144 || true

echo "=== [4/5] Building & starting all containers ==="
cd "$APP_DIR/docker"
docker compose pull --ignore-buildable 2>/dev/null || true
docker compose build --parallel
docker compose up -d

echo "=== [5/5] Waiting for api-gateway health ==="
DEADLINE=$(( $(date +%s) + 300 ))
until curl -sf http://localhost:8080/actuator/health | grep -q '"status":"UP"'; do
    if [ $(date +%s) -gt $DEADLINE ]; then
        echo "ERROR: api-gateway did not become healthy in 5 minutes."
        docker compose logs --tail=50 api-gateway
        exit 1
    fi
    echo "  Waiting for api-gateway..."
    sleep 10
done

echo ""
echo "=========================================="
echo "  LMS deployed successfully!"
echo "  UI:            http://167.233.132.212"
echo "  API Gateway:   http://167.233.132.212:8080"
echo "  MinIO Console: http://167.233.132.212:9001"
echo "  Zipkin:        http://167.233.132.212:9411"
echo "  Grafana:       http://167.233.132.212:3000"
echo "=========================================="