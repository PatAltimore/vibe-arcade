#!/usr/bin/env bash
set -euo pipefail

# Load environment variables from .env if present
if [[ -f .env ]]; then
  set +u
  # shellcheck disable=SC1091
  source .env
  set -u
fi

# Deploy this static site to Azure Static Web Apps (Free tier).
# Required env vars:
#   AZ_SUBSCRIPTION_ID
#   AZ_LOCATION
#   AZ_RESOURCE_GROUP
#   AZ_STATIC_WEB_APP_NAME

require_cmd() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "Error: required command '$1' not found in PATH."
    exit 1
  fi
}

require_env() {
  local var_name="$1"
  if [[ -z "${!var_name:-}" ]]; then
    echo "Error: environment variable '$var_name' is required."
    exit 1
  fi
}

require_cmd az
require_cmd swa

require_env AZ_SUBSCRIPTION_ID
require_env AZ_LOCATION
require_env AZ_RESOURCE_GROUP
require_env AZ_STATIC_WEB_APP_NAME

if ! az account show >/dev/null 2>&1; then
  echo "Error: Azure login is required. Run: az login"
  exit 1
fi

echo "Using subscription: ${AZ_SUBSCRIPTION_ID}"
az account set --subscription "${AZ_SUBSCRIPTION_ID}"

echo "Ensuring resource group exists: ${AZ_RESOURCE_GROUP} (${AZ_LOCATION})"
az group create \
  --name "${AZ_RESOURCE_GROUP}" \
  --location "${AZ_LOCATION}" \
  --output none

if az staticwebapp show --name "${AZ_STATIC_WEB_APP_NAME}" --resource-group "${AZ_RESOURCE_GROUP}" >/dev/null 2>&1; then
  echo "Static Web App already exists: ${AZ_STATIC_WEB_APP_NAME}"
else
  echo "Creating Static Web App (Free): ${AZ_STATIC_WEB_APP_NAME}"
  az staticwebapp create \
    --name "${AZ_STATIC_WEB_APP_NAME}" \
    --resource-group "${AZ_RESOURCE_GROUP}" \
    --location "${AZ_LOCATION}" \
    --sku Free \
    --output none
fi

echo "Fetching deployment token"
DEPLOYMENT_TOKEN="$(az staticwebapp secrets list \
  --name "${AZ_STATIC_WEB_APP_NAME}" \
  --resource-group "${AZ_RESOURCE_GROUP}" \
  --query properties.apiKey \
  --output tsv)"

if [[ -z "${DEPLOYMENT_TOKEN}" ]]; then
  echo "Error: failed to retrieve deployment token."
  exit 1
fi

echo "Deploying static site from current directory"
swa deploy \
  --app-location . \
  --output-location . \
  --env production \
  --deployment-token "${DEPLOYMENT_TOKEN}"

APP_URL="$(az staticwebapp show \
  --name "${AZ_STATIC_WEB_APP_NAME}" \
  --resource-group "${AZ_RESOURCE_GROUP}" \
  --query defaultHostname \
  --output tsv)"

echo "Deployment complete"
echo "Site URL: https://${APP_URL}"
