/**
 * ============================================================================
 * API INTEGRATION - Connecting to External Services
 * ============================================================================
 * 
 * This file demonstrates API integration patterns.
 * Works in both Node.js AND browsers.
 * 
 * NOTE: These are example functions. In a real app, you would need:
 * - Valid API endpoints
 * - Authentication tokens
 * - Error handling specific to each API
 */

// ============================================================================
// CONFIGURATION
// ============================================================================

const API_CONFIG = {
  baseUrl: 'https://api.example.com/v1',
  timeout: 5000,
  retries: 3
};

// ============================================================================
// HTTP HELPER FUNCTION
// ============================================================================

async function httpRequest(url, options = {}) {
  const defaultOptions = {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
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

// ============================================================================
// TASK API OPERATIONS
// ============================================================================

async function fetchAllTasks() {
  return httpRequest(`${API_CONFIG.baseUrl}/tasks`);
}

async function fetchTaskById(taskId) {
  return httpRequest(`${API_CONFIG.baseUrl}/tasks/${taskId}`);
}

async function createTask(taskData) {
  return httpRequest(`${API_CONFIG.baseUrl}/tasks`, {
    method: 'POST',
    body: taskData
  });
}

async function updateTask(taskId, updates) {
  return httpRequest(`${API_CONFIG.baseUrl}/tasks/${taskId}`, {
    method: 'PATCH',
    body: updates
  });
}

async function deleteTask(taskId) {
  await httpRequest(`${API_CONFIG.baseUrl}/tasks/${taskId}`, {
    method: 'DELETE'
  });
  return true;
}

// ============================================================================
// NOTIFICATION FUNCTIONS
// ============================================================================

async function sendSlackNotification(webhookUrl, task, action) {
  const message = {
    text: `Task ${action}`,
    blocks: [{
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `*${task.title}*\nPriority: ${task.priority} | Status: ${task.status}`
      }
    }]
  };
  
  return httpRequest(webhookUrl, {
    method: 'POST',
    body: message
  });
}

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

// ============================================================================
// DEMO FUNCTION (shows how API calls would work)
// ============================================================================

function demoApiIntegration() {
  console.log('=== API INTEGRATION DEMO ===');
  console.log('');
  console.log('This file demonstrates how to connect to external APIs.');
  console.log('');
  console.log('Available functions:');
  console.log('  - fetchAllTasks()       : Get all tasks from API');
  console.log('  - fetchTaskById(id)     : Get single task');
  console.log('  - createTask(data)      : Create new task');
  console.log('  - updateTask(id, data)  : Update existing task');
  console.log('  - deleteTask(id)        : Delete a task');
  console.log('  - sendSlackNotification() : Send to Slack');
  console.log('  - sendTeamsNotification() : Send to Teams');
  console.log('');
  console.log('To use these, you need valid API endpoints and authentication.');
  return 'Demo complete! Check console for details.';
}

// ============================================================================
// MAKE AVAILABLE GLOBALLY (for browser and Node.js)
// ============================================================================

// For browsers: attach to window object
if (typeof window !== 'undefined') {
  window.ApiIntegration = {
    API_CONFIG,
    httpRequest,
    fetchAllTasks,
    fetchTaskById,
    createTask,
    updateTask,
    deleteTask,
    sendSlackNotification,
    sendTeamsNotification,
    demoApiIntegration
  };
}

// For Node.js: export as module
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    API_CONFIG,
    httpRequest,
    fetchAllTasks,
    fetchTaskById,
    createTask,
    updateTask,
    deleteTask,
    sendSlackNotification,
    sendTeamsNotification,
    demoApiIntegration
  };
}
