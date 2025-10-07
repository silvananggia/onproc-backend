const io = require('socket.io-client');

// Test WebSocket updates with a real job
async function testWebSocketUpdates() {
  console.log('=== Testing WebSocket Updates ===\n');
  
  // Use a job ID that we know exists
  const jobId = '6a8c55f5-484d-4bd7-899f-be2ebc509ffc';
  
  // Connect to WebSocket
  console.log('1. Connecting to WebSocket...');
  const socket = io('https://geomimo-prototype.brin.go.id/be', {
    transports: ['websocket', 'polling'],
    autoConnect: true,
  });

  socket.on('connect', () => {
    console.log('   ✅ WebSocket connected:', socket.id);
    
    // Join job room
    console.log('2. Joining job room...');
    socket.emit('join-job', jobId);
    console.log(`   ✅ Joined job room: ${jobId}`);
    
    // Listen for job updates
    console.log('3. Listening for job updates...');
    socket.on('job-update', (data) => {
      console.log('   🔔 Received job update:', data);
    });
    
    console.log('4. Waiting for updates...');
    console.log('   (If a job is being processed, you should see updates here)');
    
    // Keep the connection alive for 30 seconds
    setTimeout(() => {
      console.log('\n5. Test completed!');
      socket.disconnect();
      process.exit(0);
    }, 30000);
  });

  socket.on('disconnect', () => {
    console.log('   ❌ WebSocket disconnected');
  });

  socket.on('connect_error', (error) => {
    console.error('   ❌ WebSocket connection error:', error.message);
    process.exit(1);
  });
}

testWebSocketUpdates();
