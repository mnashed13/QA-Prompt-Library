#!/bin/bash

# Install dependencies
npm install

# Create necessary directories
mkdir -p logs

# Run in development mode
echo "Starting API in development mode..."
npm run dev 