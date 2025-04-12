/**
 * Script to run the migration that moves CRN from patients to nutritionists
 */
const { exec } = require('child_process');
const path = require('path');

console.log('Starting migration to move CRN from patients to nutritionists...');

// Get the directory of the current script
const scriptDir = __dirname;
// Navigate to the root directory of the backend
const rootDir = path.resolve(scriptDir, '..');

// Command to run the migration
const command =
  'npm run typeorm migration:run -- -d src/config/typeorm.migrations.config.ts';

// Execute the command
exec(command, { cwd: rootDir }, (error, stdout, stderr) => {
  if (error) {
    console.error(`Error executing migration: ${error.message}`);
    return;
  }

  if (stderr) {
    console.error(`Migration stderr: ${stderr}`);
    return;
  }

  console.log(`Migration stdout: ${stdout}`);
  console.log('Migration completed successfully!');
});
