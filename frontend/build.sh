#!/bin/bash
# Build script that ensures environment variables are available
set -e

echo "Building React app..."
echo "REACT_APP_API_URL is set to: $REACT_APP_API_URL"

# Run the build
npm run build

echo "Build completed successfully!"

