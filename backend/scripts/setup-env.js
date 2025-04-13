/**
 * Script to set up the environment based on NODE_ENV
 * Usage: node scripts/setup-env.js
 */

const fs = require('fs');
const path = require('path');

// Get the environment from NODE_ENV or default to development
const env = process.env.NODE_ENV || 'development';
console.log(`Setting up environment for: ${env}`);

// Define paths
const envFilePath = path.join(__dirname, '..', `.env.${env}`);
const destEnvFilePath = path.join(__dirname, '..', '.env');

// Check if the environment file exists
if (!fs.existsSync(envFilePath)) {
  console.error(`Environment file not found: ${envFilePath}`);
  process.exit(1);
}

// Copy the environment file to .env
try {
  fs.copyFileSync(envFilePath, destEnvFilePath);
  console.log(`Successfully copied ${envFilePath} to ${destEnvFilePath}`);
} catch (error) {
  console.error(`Error copying environment file: ${error.message}`);
  process.exit(1);
}

console.log('Environment setup complete!');
