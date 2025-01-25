#!/usr/bin/env bash

# Set variables
DOWNLOAD_URL="https://github.com/rahuldshetty/llm.js/releases/download/2.0.1/llm.js-2.0.1.zip"
DEST_DIR="lib"
ZIP_FILE="llm.js-2.0.1.zip"

# Create destination directory if it doesn't exist
mkdir -p "$DEST_DIR"

# Download the ZIP file
echo "Downloading llm.js..."
curl -L -o "$ZIP_FILE" "$DOWNLOAD_URL"

# Check if the download was successful
if [ $? -ne 0 ]; then
    echo "Error: Failed to download llm.js."
    exit 1
fi

# Extract the ZIP file
echo "Extracting llm.js to $DEST_DIR..."
unzip -q "$ZIP_FILE" -d "$DEST_DIR"

# Check if extraction was successful
if [ $? -ne 0 ]; then
    echo "Error: Failed to extract llm.js."
    exit 1
fi

# Clean up the ZIP file
rm "$ZIP_FILE"

echo "llm.js successfully downloaded and extracted to $DEST_DIR."
