/**
 * API Integration Examples
 * 
 * This file demonstrates API concepts and integration patterns
 * for low-code platform development.
 */

// ============================================
// CONFIGURATION
// ============================================

const API_CONFIG = {
  baseUrl: 'https://api.example.com/v1',
  timeout: 5000,
  retries: 3
};

// ============================================
// HTTP HELPER FUNCTIONS
// ============================================

/**
 * Generic HTTP request wrapper with error handling
 * @param {string} url - Request URL
 * @param {Object} options - Fetch options
 * @returns {Promise<Object>} Response data
 */
async function httpRequest(url, options = {}) {
  const defaultOptions = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    },
    timeout: API_CONFIG.timeout
  };
  
  const finalOptions = { ...defaultOptions, ...options };
  
  try {
    const response = await fetch(url, {
      method: finalOptions.method,
      headers: finalOptions.headers,
      body: finalOptions.body ? JSON.stringify(finalOptions.body) : undefined
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('API Request failed:', error.message);
    throw error;
  }
}

// ============================================
// TASK API OPERATIONS
// ============================================

/**
 * Fetch all tasks from API
 * @returns {Promise<Array>} Array of tasks
 */
async function fetchAllTasks() {
  return httpRequest(`${API_CONFIG.baseUrl}/tasks`);
}

/**
 * Fetch a single task by ID
 * @param {number} taskId - Task ID
 * @returns {Promise<Object>} Task object
 */
async function fetchTaskById(taskId) {
  return httpRequest(`${API_CONFIG.baseUrl}/tasks/${taskId}`);
}

/**
 * Create a new task
 * @param {Object} taskData - Task data to create
 * @returns {Promise<Object>} Created task
 */
async function createTask(taskData) {
  return httpRequest(`${API_CONFIG.baseUrl}/tasks`, {
    method: 'POST',
    body: taskData
  });
}

/**
 * Update an existing task
 * @param {number} taskId - Task ID
 * @param {Object} updates - Fields to update
 * @returns {Promise<Object>} Updated task
 */
async function updateTask(taskId, updates) {
  return httpRequest(`${API_CONFIG.baseUrl}/tasks/${taskId}`, {
    method: 'PATCH',
    body: updates
  });
}

/**
 * Delete a task
 * @param {number} taskId - Task ID
 * @returns {Promise<boolean>} Success status
 */
async function deleteTask(taskId) {
  await httpRequest(`${API_CONFIG.baseUrl}/tasks/${taskId}`, {
    method: 'DELETE'
  });
  return true;
}

// ============================================
// WEBHOOK NOTIFICATIONS
// ============================================

/**
 * Send notification to Slack webhook
 * @param {string} webhookUrl - Slack webhook URL
 * @param {Object} task - Task object
 * @param {string} action - Action performed (created, updated, completed)
 * @returns {Promise<Object>} Response
 */
async function sendSlackNotification(webhookUrl, task, action) {
  const message = {
    text: `Task ${action}`,
    blocks: [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*${task.title}*\nPriority: ${task.priority} | Status: ${task.status}`
        }
      }
    ]
  };
  
  return httpRequest(webhookUrl, {
    method: 'POST',
    body: message
  });
}

/**
 * Send notification to Microsoft Teams webhook
 * @param {string} webhookUrl - Teams webhook URL
 * @param {Object} task - Task object
 * @param {string} action - Action performed
 * @returns {Promise<Object>} Response
 */
async function sendTeamsNotification(webhookUrl, task, action) {
  const message = {
    '@type': 'MessageCard',
    '@context': 'http://schema.org/extensions',
    themeColor: '0076D7',
    summary: `Task ${action}`,
    sections: [{
      activityTitle: `Task ${action}`,
      facts: [
        { name: 'Title', value: task.title },
        { name: 'Priority', value: task.priority },
        { name: 'Status', value: task.status }
      ],
      markdown: true
    }]
  };
  
  return httpRequest(webhookUrl, {
    method: 'POST',
    body: message
  });
}

// ============================================
// EMAIL NOTIFICATIONS (via API)
// ============================================

/**
 * Send task assignment email via email service API
 * @param {Object} emailConfig - Email service configuration
 * @param {Object} task - Task object
 * @param {Object} assignee - User assigned to task
 * @returns {Promise<Object>} Response
 */
async function sendTaskAssignmentEmail(emailConfig, task, assignee) {
  const emailData = {
    to: assignee.email,
    subject: `New Task Assigned: ${task.title}`,
    body: `
Hi ${assignee.name},

You have been assigned a new task:

Title: ${task.title}
Priority: ${task.priority}
Due Date: ${task.due_date || 'Not set'}

Please log in to view the full details.

Best regards,
Task Management System
    `.trim()
  };
  
  return httpRequest(`${emailConfig.apiUrl}/send`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${emailConfig.apiKey}`,
      'Content-Type': 'application/json'
    },
    body: emailData
  });
}

// ============================================
// EXTERNAL SERVICE INTEGRATIONS
// ============================================

/**
 * Create a calendar event for task deadline
 * @param {Object} calendarConfig - Calendar API configuration
 * @param {Object} task - Task object
 * @returns {Promise<Object>} Calendar event
 */
async function createCalendarEvent(calendarConfig, task) {
  const eventData = {
    summary: `Task: ${task.title}`,
    description: task.description || '',
    start: {
      date: task.due_date
    },
    end: {
      date: task.due_date
    },
    reminders: {
      useDefault: false,
      overrides: [
        { method: 'email', minutes: 24 * 60 },  // 1 day before
        { method: 'popup', minutes: 60 }         // 1 hour before
      ]
    }
  };
  
  return httpRequest(`${calendarConfig.apiUrl}/calendar/events`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${calendarConfig.accessToken}`
    },
    body: eventData
  });
}

/**
 * Log task completion to time tracking API
 * @param {Object} timeConfig - Time tracking API config
 * @param {Object} task - Completed task
 * @param {number} hoursSpent - Hours to log
 * @returns {Promise<Object>} Time entry
 */
async function logTimeEntry(timeConfig, task, hoursSpent) {
  const timeEntry = {
    task_id: task.id,
    project_id: task.project_id,
    hours: hoursSpent,
    description: `Completed: ${task.title}`,
    date: new Date().toISOString().split('T')[0]
  };
  
  return httpRequest(`${timeConfig.apiUrl}/time-entries`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${timeConfig.apiKey}`
    },
    body: timeEntry
  });
}

// ============================================
// WEBHOOK HANDLERS (for receiving data)
// ============================================

/**
 * Handle incoming webhook from external service
 * Example: Process data from an external form submission
 * @param {Object} payload - Webhook payload
 * @returns {Object} Processing result
 */
function handleExternalWebhook(payload) {
  // Validate webhook signature (security best practice)
  // const isValid = verifyWebhookSignature(payload);
  // if (!isValid) throw new Error('Invalid webhook signature');
  
  const { event, data } = payload;
  
  switch (event) {
    case 'form.submitted':
      // Convert form submission to task
      return {
        action: 'create_task',
        taskData: {
          title: data.form_title,
          description: data.form_data.description,
          priority: 'Medium',
          status: 'Todo'
        }
      };
      
    case 'task.completed':
      // External system completed a task
      return {
        action: 'update_task',
        taskId: data.task_id,
        updates: {
          status: 'Done',
          completed_at: new Date().toISOString()
        }
      };
      
    default:
      return { action: 'ignored', reason: 'Unknown event type' };
  }
}

// ============================================
// BATCH OPERATIONS
// ============================================

/**
 * Sync tasks with external system
 * @param {Array} localTasks - Local task array
 * @param {string} externalApiUrl - External API URL
 * @returns {Promise<Object>} Sync result
 */
async function syncTasksWithExternal(localTasks, externalApiUrl) {
  const results = {
    created: 0,
    updated: 0,
    errors: []
  };
  
  for (const task of localTasks) {
    try {
      const externalId = task.external_id;
      
      if (externalId) {
        // Update existing
        await httpRequest(`${externalApiUrl}/tasks/${externalId}`, {
          method: 'PUT',
          body: task
        });
        results.updated++;
      } else {
        // Create new
        const response = await httpRequest(`${externalApiUrl}/tasks`, {
          method: 'POST',
          body: task
        });
        task.external_id = response.id;
        results.created++;
      }
    } catch (error) {
      results.errors.push({
        taskId: task.id,
        error: error.message
      });
    }
  }
  
  return results;
}

// ============================================
// EXPORTS
// ============================================

module.exports = {
  // HTTP
  httpRequest,
  
  // Task Operations
  fetchAllTasks,
  fetchTaskById,
  createTask,
  updateTask,
  deleteTask,
  
  // Notifications
  sendSlackNotification,
  sendTeamsNotification,
  sendTaskAssignmentEmail,
  
  // External Services
  createCalendarEvent,
  logTimeEntry,
  
  // Webhooks
  handleExternalWebhook,
  
  // Batch
  syncTasksWithExternal
};
