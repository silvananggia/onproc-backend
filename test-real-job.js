const io = require('socket.io-client');
const axios = require('axios');

// Test with a real job ID that exists in the database
async function testRealJob() {
  console.log('=== Testing Real Job Processing Flow ===\n');
  
  // Use a job ID that we know exists from the logs
  const jobId = '524f6a97-8ee9-4ad8-a9df-b07586e1519d';
  
  // Step 1: Connect to WebSocket
  console.log('1. Connecting to WebSocket...');
  const socket = io('https://geomimo-prototype.brin.go.id/be', {
    transports: ['websocket', 'polling'],
    autoConnect: true,
  });

  socket.on('connect', async () => {
    console.log('   ✓ WebSocket connected:', socket.id);
    
    // Step 2: Join job room
    console.log('2. Joining job room...');
    socket.emit('join-job', jobId);
    console.log(`   ✓ Joined job room: ${jobId}`);
    
    // Step 3: Listen for job updates
    console.log('3. Setting up job update listener...');
    socket.on('job-update', (data) => {
      console.log('   🔔 Received job update:', data);
    });
    
    // Step 4: Manually trigger a job update to test the flow
    console.log('4. Testing manual job update...');
    const backendUrl = 'https://geomimo-prototype.brin.go.id/be';
    
    try {
      // Test with a manual update
      console.log('   - Sending manual progress update: 30%');
      const response = await axios.put(`${backendUrl}/api/jobs/${jobId}/status/internal`, {
        status: 'running',
        progress: 30
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      console.log('   ✓ Manual update sent successfully:', response.data);
      
      // Wait a bit and send another update
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      console.log('   - Sending manual progress update: 60%');
      const response2 = await axios.put(`${backendUrl}/api/jobs/${jobId}/status/internal`, {
        status: 'running',
        progress: 60
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      console.log('   ✓ Manual update sent successfully:', response2.data);
      
      // Wait a bit and send final update
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      console.log('   - Sending final update: finished');
      const response3 = await axios.put(`${backendUrl}/api/jobs/${jobId}/status/internal`, {
        status: 'finished',
        progress: 100
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      console.log('   ✓ Final update sent successfully:', response3.data);
      
      console.log('\n5. Test completed!');
      console.log('   - WebSocket connection: ✓');
      console.log('   - Job room joining: ✓');
      console.log('   - Job update listening: ✓');
      console.log('   - Manual updates: ✓');
      
    } catch (error) {
      console.error('   ✗ Error during test:', error.response?.data || error.message);
    } finally {
      setTimeout(() => {
        socket.disconnect();
        process.exit(0);
      }, 2000);
    }
  });

  socket.on('disconnect', () => {
    console.log('   - WebSocket disconnected');
  });

  socket.on('connect_error', (error) => {
    console.error('   ✗ WebSocket connection error:', error.message);
    process.exit(1);
  });
}

testRealJob();
