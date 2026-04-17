# vibe-arcade
Website listing vibe coded games and apps.

[Vibe Arcade live site](https://wonderful-ocean-071bf501e.1.azurestaticapps.net/)

## Deploy To Azure Static Web Apps (Free)

This repo includes a deployment script for Azure Static Web Apps using the Free tier.

### Prerequisites

- Azure CLI (`az`)
- Static Web Apps CLI (`swa`), install with: `npm install -g @azure/static-web-apps-cli`
- Logged into Azure: `az login`

### One-command deploy

From the repo root:

```bash
AZ_SUBSCRIPTION_ID="<subscription-id>" \
AZ_LOCATION="eastus2" \
AZ_RESOURCE_GROUP="rg-vibe-arcade" \
AZ_STATIC_WEB_APP_NAME="vibe-arcade-site" \
bash scripts/deploy-azure-swa.sh
```

### Required environment variables

- `AZ_SUBSCRIPTION_ID`: Azure subscription where resources are created
- `AZ_LOCATION`: Azure region for the Static Web App (for example `eastus2`)
- `AZ_RESOURCE_GROUP`: Resource group name
- `AZ_STATIC_WEB_APP_NAME`: Static Web App name (must be globally unique)

The script is idempotent: if the resource group or Static Web App already exists, it reuses them and only deploys updated site files.
