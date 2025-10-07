// backend/models/User.js
const db = require('../config/knex');
const { v4: uuidv4 } = require('uuid');



async function findJobId(id) {
  const job = await db('jobs').where({ id }).first();
  return job;
}

async function createJob({ jobId, username, jobname, command, cpuRequired, priority, timeStart, timeFinish }) {
  try {
   // const jobId = uuidv4(); // Generate job ID

    console.log('🕐 Backend: Creating job with timestamps:');
    console.log('  - Job ID:', jobId);
    console.log('  - Time Start:', timeStart);
    console.log('  - Time Finish:', timeFinish);

    const [job] = await db('jobs').insert({
      id: jobId,
      username: username,
      job_name: jobname,
      command : command, // The HTTP GET command to execute the Flask API
      status: 'queued', // Default status
      cpu_required: cpuRequired,
      priority,
      time_start: timeStart,
      time_finish: timeFinish,
    }).returning(['id', 'username', 'job_name', 'status', 'cpu_required', 'priority', 'time_start', 'time_finish']);
    
    return job;
  } catch (error) {
    console.error('Error creating job:', error);
    throw error;
  }
}

async function getJobById(id) {
  // First get the job data
  const job = await db('jobs')
    .where({ id })
    .first();
  
  if (!job) {
    return { message: 'Job not found' }; // Return message if job does not exist
  }

  // Then get the results for this job
  const results = await db('results')
    .where({ jobid: id })
    .select('*');

  // Combine job data with results
  return {
    ...job,
    results: results
  };
}

async function getAllJobsByUser(username) {
  const jobs = await db('jobs')
    .where({ username: username })
    .orderBy('created_at', 'desc'); // Sort by created_at from newest to oldest
  return jobs;
}

async function updateJobStatus(jobId, status, progress = null) {
  try {
    const updateData = { status };
    if (progress !== null) {
      updateData.progress = progress;
    }
    
    // Set time_finish when job completes
    if (status === 'finished' || status === 'failed') {
      updateData.time_finish = new Date().toISOString();
      console.log('🕐 Backend: Job completed, setting time_finish:', updateData.time_finish);
    }
    
    const [updatedJob] = await db('jobs')
      .where({ id: jobId })
      .update(updateData)
      .returning('*');
    
    return updatedJob;
  } catch (error) {
    console.error('Error updating job status:', error);
    throw error;
  }
}

module.exports = {
  findJobId,
  createJob,
  getJobById, 
  getAllJobsByUser,
  updateJobStatus,
};
