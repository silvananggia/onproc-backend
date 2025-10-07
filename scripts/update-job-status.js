const axios = require('axios');

/**
 * Utility function to update job status and progress
 * This can be used by external processes to update job status
 */
async function updateJobStatus(jobId, status, progress = null) {
  try {
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:9001';
    
    const response = await axios.put(`${backendUrl}/api/jobs/${jobId}/status`, {
      status,
      progress
    });
    
    console.log(`Job ${jobId} updated: status=${status}, progress=${progress}%`);
    return response.data;
  } catch (error) {
    console.error('Error updating job status:', error.response?.data || error.message);
    throw error;
  }
}

// Example usage
if (require.main === module) {
  const jobId = process.argv[2];
  const status = process.argv[3] || 'running';
  const progress = process.argv[4] ? parseInt(process.argv[4]) : null;
  
  if (!jobId) {
    console.error('Usage: node update-job-status.js <job-id> [status] [progress]');
    console.log('Examples:');
    console.log('  node update-job-status.js abc123 running 50');
    console.log('  node update-job-status.js abc123 finished 100');
    process.exit(1);
  }
  
  updateJobStatus(jobId, status, progress)
    .then(() => console.log('Job status updated successfully'))
    .catch(console.error);
}

module.exports = { updateJobStatus };
