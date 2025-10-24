import { execSync } from 'node:child_process';

// Ensure database is migrated before tests
try {
  execSync('npm run prisma:deploy', { stdio: 'inherit' });
} catch (e) {
  // ignore, will fail in environments without DB
}
