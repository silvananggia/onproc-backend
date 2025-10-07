const axios = require('axios');

// Configuration
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:9001';
const JOB_ID = process.argv[2]; // Get job ID from command line argument

if (!JOB_ID) {
  console.error('Please provide a job ID as an argument');
  console.log('Usage: node test-job-updates.js <job-id>');
  process.exit(1);
}

// Simulate job progress updates
async function simulateJobProgress() {
  console.log(`Simulating job progress for job ID: ${JOB_ID}`);
  
  const statuses = ['queued', 'running', 'running', 'running', 'finished'];
  const progressValues = [0, 25, 50, 75, 100];
  
  for (let i = 0; i < statuses.length; i++) {
    try {
      const response = await axios.put(`${BACKEND_URL}/api/jobs/${JOB_ID}/status`, {
        status: statuses[i],
        progress: progressValues[i]
      });
      
      console.log(`Updated job ${JOB_ID}: status=${statuses[i]}, progress=${progressValues[i]}%`);
      
      // Wait 2 seconds between updates
      if (i < statuses.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    } catch (error) {
      console.error('Error updating job:', error.response?.data || error.message);
    }
  }
  
  console.log('Job simulation completed!');
}

// Run the simulation
simulateJobProgress().catch(console.error);
