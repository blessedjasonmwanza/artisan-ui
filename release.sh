#!/bin/bash

# Ensure we're in the project root
cd "$(dirname "$0")"

# Ensure Node environment is in PATH
export PATH="/Users/Abraham/.nvm/versions/node/v24.11.1/bin:$PATH"

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Starting Artisan UI Release Process...${NC}"

# 1. Get the latest tag
LATEST_TAG=$(git describe --tags --abbrev=0 2>/dev/null)
if [ -z "$LATEST_TAG" ]; then
    LATEST_TAG="v1.0.0"
    NEXT_TAG="v1.0.1"
else
    # Parse version parts (assumes vX.Y.Z format)
    BASE_VERSION=$(echo $LATEST_TAG | sed 's/v//')
    IFS='.' read -r major minor patch <<< "$BASE_VERSION"
    NEXT_PATCH=$((patch + 1))
    NEXT_TAG="v$major.$minor.$NEXT_PATCH"
fi

echo -e "${YELLOW}Current version: ${LATEST_TAG}${NC}"
read -p "Enter next version [${NEXT_TAG}]: " INPUT_TAG
NEXT_TAG=${INPUT_TAG:-$NEXT_TAG}

# 2. Build the UI
echo -e "${BLUE}📦 Building React assets...${NC}"
cd ui
if npm run build; then
    echo -e "${GREEN}✅ Build successful!${NC}"
else
    echo -e "\033[0;31m❌ Build failed. Aborting.${NC}"
    exit 1
fi
cd ..

# 3. Stage changes
echo -e "${BLUE}📝 Staging changes...${NC}"
git add resources/dist
git add .

# 4. Commit message
read -p "Enter commit message [Release ${NEXT_TAG}]: " COMMIT_MSG
COMMIT_MSG=${COMMIT_MSG:-"Release ${NEXT_TAG}"}

# 5. Execute git commands
echo -e "${BLUE}🔧 Committing and Tagging...${NC}"
git commit -m "$COMMIT_MSG"
git tag "$NEXT_TAG"

# 6. Push to GitHub
echo -e "${BLUE}☁️  Pushing to GitHub...${NC}"
git push origin main
git push origin "$NEXT_TAG"

echo -e "${GREEN}🎉 Version ${NEXT_TAG} successfully published!${NC}"
echo -e "${YELLOW}Note: Packagist will pick up this new version automatically within minutes.${NC}"
