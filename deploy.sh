#!/bin/bash

# =============================
# Deployment script for Backend
# =============================

APP_NAME="tdhv2-server"
APP_DIR="/home/ubuntu/tdhv2-server"
BRANCH="develop"
PM2_PROCESS_NAME="tdhv2-backend"

# Go to app directory
cd $APP_DIR || exit

# Pull latest changes
echo "Pulling latest changes from $BRANCH..."
git fetch origin $BRANCH
git reset --hard origin/$BRANCH

# Install dependencies
echo "Installing dependencies..."
npm install

# Build the app
# echo "Building the app..."
# npm run build

# Restart the app with PM2 and update env
echo "Restarting PM2 process..."
pm2 restart $PM2_PROCESS_NAME --update-env || pm2 start npm --name "$PM2_PROCESS_NAME" -- start

# Save PM2 process list (optional)
pm2 save

echo "Deployment completed successfully!"