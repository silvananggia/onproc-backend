const express = require('express');
const router = express.Router();
const { createJob, getJobById, getAllJobsByUser, updateJobStatus } = require('../models/Job');
const { authorizeRole } = require('../middleware/role');

// Route to create a new job
router.post('/jobs',authorizeRole(['public', 'admin']),  async (req, res) => {
  try {
    const jobData = req.body; // Expecting JSON body
    const job = await createJob(jobData);
    res.status(201).json(job); // Respond with the created job
  } catch (error) {
    res.status(500).json({ error: 'Failed to create job' });
  }
});

// Route to get a job by ID
router.get('/jobs/:id',authorizeRole(['public', 'admin']), async (req, res) => {
  try {
    const job = await getJobById(req.params.id);
    if (job) {
      res.status(200).json(job); // Respond with the job found
    } else {
      res.status(404).json({ error: 'Job not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve job' });
  }
});

// Route to get all jobs by user
router.get('/jobs/user/:username',authorizeRole(['public', 'admin']), async (req, res) => {
  try {
    console.log('📡 Backend: Getting jobs for user:', req.params.username);
    const jobs = await getAllJobsByUser(req.params.username);
    console.log('📡 Backend: Found jobs:', jobs.length);
    res.status(200).json(jobs); // Respond with the list of jobs
  } catch (error) {
    console.error('❌ Backend: Error retrieving jobs:', error);
    res.status(500).json({ 
      error: 'Failed to retrieve jobs',
      details: error.message 
    });
  }
});

// Route to update job status and progress (internal - no auth required)
router.put('/jobs/:id/status/internal', async (req, res) => {
  try {
    const { status, progress } = req.body;
    const jobId = req.params.id;
    
    console.log('📡 Backend: Internal update received for job:', jobId);
    console.log('📡 Backend: Status:', status, 'Progress:', progress);
    
    const updatedJob = await updateJobStatus(jobId, status, progress);
    
    if (updatedJob) {
      // Emit real-time update to clients listening to this job
      const io = req.app.get('io');
      if (io) {
        const updateData = {
          jobId,
          status: updatedJob.status,
          progress: updatedJob.progress,
          updatedAt: new Date().toISOString()
        };
        console.log('📡 Backend: Sending WebSocket update to room job-' + jobId);
        console.log('📡 Backend: Update data:', updateData);
        io.to(`job-${jobId}`).emit('job-update', updateData);
        console.log('📡 Backend: WebSocket update sent successfully');
      } else {
        console.log('❌ Backend: Socket.IO not available');
      }
      
      res.status(200).json(updatedJob);
    } else {
      console.log('❌ Backend: Job not found:', jobId);
      res.status(404).json({ error: 'Job not found' });
    }
  } catch (error) {
    console.log('❌ Backend: Error updating job status:', error.message);
    res.status(500).json({ error: 'Failed to update job status' });
  }
});

// Route to update job status and progress
router.put('/jobs/:id/status', authorizeRole(['public', 'admin']), async (req, res) => {
  try {
    const { status, progress } = req.body;
    const jobId = req.params.id;
    
    const updatedJob = await updateJobStatus(jobId, status, progress);
    
    if (updatedJob) {
      // Emit real-time update to clients listening to this job
      const io = req.app.get('io');
      if (io) {
        io.to(`job-${jobId}`).emit('job-update', {
          jobId,
          status: updatedJob.status,
          progress: updatedJob.progress,
          updatedAt: new Date().toISOString()
        });
      }
      
      res.status(200).json(updatedJob);
    } else {
      res.status(404).json({ error: 'Job not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to update job status' });
  }
});

module.exports = router;