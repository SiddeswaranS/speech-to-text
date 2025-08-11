const { spawn } = require('child_process');
const path = require('path');

console.log('🎭 Starting Playwright UI Tests for VoiceScript\n');

// Start the server
console.log('🚀 Starting local server on port 7001...');
const server = spawn('npm', ['run', 'serve'], {
  shell: true,
  detached: false
});

// Wait for server to start
setTimeout(() => {
  console.log('🧪 Running Playwright tests...\n');
  
  // Run Playwright tests
  const tests = spawn('npx', ['playwright', 'test', '--reporter=list'], {
    shell: true,
    stdio: 'inherit'
  });
  
  tests.on('close', (code) => {
    console.log(`\n✅ Tests completed with exit code ${code}`);
    
    // Kill the server
    console.log('🛑 Stopping server...');
    if (process.platform === 'win32') {
      spawn('taskkill', ['/pid', server.pid, '/f', '/t']);
    } else {
      server.kill('SIGTERM');
    }
    
    process.exit(code);
  });
}, 3000);

// Handle interruption
process.on('SIGINT', () => {
  console.log('\n⚠️  Test run interrupted');
  if (process.platform === 'win32') {
    spawn('taskkill', ['/pid', server.pid, '/f', '/t']);
  } else {
    server.kill('SIGTERM');
  }
  process.exit(1);
});