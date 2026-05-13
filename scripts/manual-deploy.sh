#!/usr/bin/env bash
set -euo pipefail

load_env_file() {
  local env_file="$1"
  [[ -f "$env_file" ]] || return 0

  while IFS= read -r line || [[ -n "$line" ]]; do
    local trimmed="${line#${line%%[![:space:]]*}}"
    trimmed="${trimmed%${trimmed##*[![:space:]]}}"
    [[ -z "$trimmed" || "$trimmed" == \#* ]] && continue
    [[ "$trimmed" != *=* ]] && continue

    local key="${trimmed%%=*}"
    local value="${trimmed#*=}"
    key="${key#${key%%[![:space:]]*}}"
    key="${key%${key##*[![:space:]]}}"
    value="${value#${value%%[![:space:]]*}}"
    value="${value%${value##*[![:space:]]}}"
    value="${value%\r}"

    if [[ "$value" == \"*\" && "$value" == *\" ]]; then
      value="${value:1:${#value}-2}"
    fi

    if [[ -n "$key" && -z "${!key:-}" ]]; then
      export "$key=$value"
    fi
  done < "$env_file"
}

load_wiki_db_credentials() {
  local creds_file="$1"
  [[ -f "$creds_file" ]] || return 0

  local db_host db_port db_username db_password db_name
  db_host="$(awk -F' = ' '/^host = / {gsub(/"/, "", $2); print $2; exit}' "$creds_file")"
  db_port="$(awk -F' = ' '/^port = / {gsub(/"/, "", $2); print $2; exit}' "$creds_file")"
  db_username="$(awk -F' = ' '/^username = / {gsub(/"/, "", $2); print $2; exit}' "$creds_file")"
  db_password="$(awk -F' = ' '/^password = / {sub(/^password = "/, "", $0); sub(/"$/, "", $0); print $0; exit}' "$creds_file")"
  db_name="$(awk -F' = ' '/^database = / {gsub(/"/, "", $2); print $2; exit}' "$creds_file")"

  if [[ -n "$db_host" && -n "$db_port" && -n "$db_username" && -n "$db_password" && -n "$db_name" ]]; then
    local encoded_password
    encoded_password="$(node -e 'console.log(encodeURIComponent(process.argv[1]))' "$db_password")"
    export DATABASE_URL="postgresql://${db_username}:${encoded_password}@${db_host}:${db_port}/${db_name}"
  fi
}

load_wiki_domain() {
  local domain_file="$1"
  [[ -f "$domain_file" ]] || return 0

  local domain
  domain="$(tr -d '[:space:]' < "$domain_file")"
  if [[ -z "${NEXTAUTH_URL:-}" && -n "$domain" ]]; then
    export NEXTAUTH_URL="$domain"
  fi
}

load_env_file ".env.local"
load_env_file ".env.deploy.local"
load_wiki_db_credentials "wiki-team/db-credentials.txt"
load_wiki_domain "wiki-team/domain.txt"

export INTERNAL_POSTGRES_ENABLED="${INTERNAL_POSTGRES_ENABLED:-true}"
export INTERNAL_POSTGRES_HOST="${INTERNAL_POSTGRES_HOST:-codebase-wiki-postgres}"
export INTERNAL_POSTGRES_PORT="${INTERNAL_POSTGRES_PORT:-5432}"
export INTERNAL_POSTGRES_DB="${INTERNAL_POSTGRES_DB:-codebase_wiki}"
export INTERNAL_POSTGRES_USER="${INTERNAL_POSTGRES_USER:-codebase_wiki}"
export INTERNAL_POSTGRES_PASSWORD="${INTERNAL_POSTGRES_PASSWORD:-codebase_wiki_demo_password}"

if [[ "${INTERNAL_POSTGRES_ENABLED}" == "true" ]]; then
  encoded_internal_postgres_password="$(node -e 'console.log(encodeURIComponent(process.argv[1]))' "$INTERNAL_POSTGRES_PASSWORD")"
  export DATABASE_URL="postgresql://${INTERNAL_POSTGRES_USER}:${encoded_internal_postgres_password}@${INTERNAL_POSTGRES_HOST}:${INTERNAL_POSTGRES_PORT}/${INTERNAL_POSTGRES_DB}"
  export DATABASE_SSL_ENABLED="false"
  export DATABASE_SSL_REJECT_UNAUTHORIZED="false"
  export DATABASE_SSL_ROOT_CERT=""
fi

export DATABASE_SSL_ENABLED="${DATABASE_SSL_ENABLED:-true}"
export DATABASE_SSL_REJECT_UNAUTHORIZED="${DATABASE_SSL_REJECT_UNAUTHORIZED:-false}"
export DATABASE_SSL_ROOT_CERT="${DATABASE_SSL_ROOT_CERT:-}"

if [[ -z "${KUBECONFIG:-}" ]]; then
  if [[ -f "wiki-team/kubeconfig.yaml" ]]; then
    export KUBECONFIG="wiki-team/kubeconfig.yaml"
  fi
fi

export DOCKERHUB_USERNAME="${DOCKERHUB_USERNAME:-hshinosa}"

if [[ -z "${KUBECONFIG:-}" && ! -f "${HOME}/.kube/config" ]]; then
  echo "Missing kubeconfig. Set KUBECONFIG or create ~/.kube/config." >&2
  exit 1
fi

if [[ -z "${DATABASE_URL:-}" || -z "${NEXTAUTH_SECRET:-}" || -z "${ENCRYPTION_SECRET_KEY:-}" ]]; then
  echo "Missing required runtime env vars after loading .env.local/wiki-team files: DATABASE_URL, NEXTAUTH_SECRET, ENCRYPTION_SECRET_KEY." >&2
  exit 1
fi

if [[ -z "${OPENAI_API_KEY:-}" ]]; then
  echo "Missing OPENAI_API_KEY." >&2
  exit 1
fi

export NEXTAUTH_URL="${NEXTAUTH_URL:-https://wiki-team.hackathon.sev-2.com}"
if [[ "$NEXTAUTH_URL" == http://* && "$NEXTAUTH_URL" != http://localhost* && "$NEXTAUTH_URL" != http://127.0.0.1* ]]; then
  export NEXTAUTH_URL="https://${NEXTAUTH_URL#http://}"
fi
export KUBE_NAMESPACE="${KUBE_NAMESPACE:-wiki-team}"
export IMAGE_NAME="${IMAGE_NAME:-docker.io/${DOCKERHUB_USERNAME}/codebase-wiki}"
export IMAGE_TAG="${IMAGE_TAG:-latest}"

if [[ -n "${DOCKERHUB_TOKEN:-}" ]]; then
  echo "Logging in to DockerHub..."
  printf '%s' "$DOCKERHUB_TOKEN" | docker login -u "$DOCKERHUB_USERNAME" --password-stdin
else
  echo "Skipping DockerHub login because an existing Docker credential is expected."
fi

echo "Building image ${IMAGE_NAME}:${IMAGE_TAG}..."
docker build -t "${IMAGE_NAME}:${IMAGE_TAG}" .

echo "Pushing image ${IMAGE_NAME}:${IMAGE_TAG}..."
docker push "${IMAGE_NAME}:${IMAGE_TAG}"

echo "Applying Kubernetes namespace and secret..."
kubectl create namespace "$KUBE_NAMESPACE" --dry-run=client -o yaml | kubectl apply -f -

kubectl create secret generic codebase-wiki-postgres \
  --namespace "$KUBE_NAMESPACE" \
  --from-literal=POSTGRES_DB="$INTERNAL_POSTGRES_DB" \
  --from-literal=POSTGRES_USER="$INTERNAL_POSTGRES_USER" \
  --from-literal=POSTGRES_PASSWORD="$INTERNAL_POSTGRES_PASSWORD" \
  --dry-run=client -o yaml | kubectl apply -f -

kubectl create secret generic codebase-wiki-env \
  --namespace "$KUBE_NAMESPACE" \
  --from-literal=DATABASE_URL="$DATABASE_URL" \
  --from-literal=DATABASE_SSL_ENABLED="$DATABASE_SSL_ENABLED" \
  --from-literal=DATABASE_SSL_REJECT_UNAUTHORIZED="$DATABASE_SSL_REJECT_UNAUTHORIZED" \
  --from-literal=DATABASE_SSL_ROOT_CERT="$DATABASE_SSL_ROOT_CERT" \
  --from-literal=OPENAI_API_KEY="$OPENAI_API_KEY" \
  --from-literal=OPENAI_BASE_URL="${OPENAI_BASE_URL:-https://api.openai.com/v1}" \
  --from-literal=AI_MODEL="${AI_MODEL:-gpt-4-turbo-preview}" \
  --from-literal=AI_EMBEDDING_MODEL="${AI_EMBEDDING_MODEL:-text-embedding-3-small}" \
  --from-literal=GEMINI_API_KEY="${GEMINI_API_KEY:-}" \
  --from-literal=GEMINI_EMBEDDING_MODEL="${GEMINI_EMBEDDING_MODEL:-text-embedding-004}" \
  --from-literal=ENCRYPTION_SECRET_KEY="$ENCRYPTION_SECRET_KEY" \
  --from-literal=NEXTAUTH_URL="$NEXTAUTH_URL" \
  --from-literal=NEXTAUTH_SECRET="$NEXTAUTH_SECRET" \
  --from-literal=TEMP_STORAGE_PATH="${TEMP_STORAGE_PATH:-/tmp/codebase-wiki}" \
  --from-literal=DOCS_STORAGE_PATH="${DOCS_STORAGE_PATH:-/tmp/codebase-wiki-docs}" \
  --from-literal=VECTOR_INDEX_PATH="${VECTOR_INDEX_PATH:-/tmp/codebase-wiki-index}" \
  --dry-run=client -o yaml | kubectl apply -f -

echo "Applying manifests..."
kubectl apply -k deploy/k8s

echo "Waiting for PostgreSQL rollout..."
kubectl rollout status deployment/codebase-wiki-postgres -n "$KUBE_NAMESPACE" --timeout=5m

echo "Updating deployment image..."
kubectl set image deployment/codebase-wiki web="${IMAGE_NAME}:${IMAGE_TAG}" -n "$KUBE_NAMESPACE"

echo "Restarting deployment to pick up refreshed secrets..."
kubectl rollout restart deployment/codebase-wiki -n "$KUBE_NAMESPACE"

echo "Waiting for rollout..."
kubectl rollout status deployment/codebase-wiki -n "$KUBE_NAMESPACE" --timeout=5m
