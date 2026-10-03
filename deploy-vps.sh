#!/bin/bash
set -e

echo "=========================================="
echo "🚀 Deploying KhelPediA Admin Panel on VPS"
echo "=========================================="

# 1. Pull latest code from GitHub
echo "📦 Pulling latest changes from Git..."
git pull origin main

# 2. Install dependencies
echo "📥 Installing dependencies..."
npm install

# 3. Build Next.js application
echo "🔨 Building Next.js application..."
npm run build

# 4. Restart or Start PM2 Process
echo "🔄 Starting / Reloading PM2 process..."
if command -v pm2 &> /dev/null; then
    pm2 restart khelpedia-admin || pm2 start ecosystem.config.cjs
    pm2 save
    echo "✅ PM2 process 'khelpedia-admin' is active!"
    pm2 status
else
    echo "⚠️ PM2 not found globally. You can install it with: npm install -g pm2"
    echo "Or start directly with: npm start"
fi

echo "=========================================="
echo "✨ KhelPediA Admin deployed successfully!"
echo "📍 Listening on: http://127.0.0.1:3001"
echo "=========================================="
