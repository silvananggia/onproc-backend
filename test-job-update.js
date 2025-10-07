const axios = require('axios');

async function testJobUpdate() {
  try {
    const jobId = '6f82af4e-e435-46b3-a67f-41fb1f03e3e6';
    const backendUrl = 'http://localhost:9001';
    
    console.log(`Testing job update for job ID: ${jobId}`);
    
    // Test updating job status and progress
    const response = await axios.put(`${backendUrl}/api/jobs/${jobId}/status`, {
      status: 'running',
      progress: 50
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test' // This might fail due to auth, but let's see
      }
    });
    
    console.log('Job update successful:', response.data);
  } catch (error) {
    console.error('Job update failed:', error.response?.data || error.message);
  }
}

testJobUpdate();
