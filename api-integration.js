/**
 * ============================================================================
 * API INTEGRATION - Connecting to External Services
 * ============================================================================
 * 
 * WHAT THIS FILE DOES:
 * This file handles communication between our app and external services.
 * It sends data out (like notifications) and brings data in (like fetching tasks).
 * 
 * WHY THIS MATTERS:
 * Modern applications don't work in isolation - they need to:
 * - Send email/SMS notifications
 * - Post messages to Slack/Teams
 * - Sync with calendars
 * - Connect to databases and other apps
 * 
 * RELATIONSHIP TO THE WHOLE APP:
 * If data-model.js is the FOUNDATION and task-utils.js is the MECHANICS,
 * this file is the COMMUNICATION SYSTEM. It allows our app to talk to
 * the outside world.
 * 
 * KEY CONCEPTS:
 * - API (Application Programming Interface): A way for software to talk to other software
 * - HTTP: The protocol used for web communication (like a language)
 * - Request: What we send to a server
 * - Response: What the server sends back
 * - Webhook: A way for external services to send US data automatically
 */

// ============================================================================
// CONFIGURATION
// ============================================================================
// Configuration is where we store settings that might change between environments.
// Like a control panel with switches and dials.
// ============================================================================

/**
 * API_CONFIG - Central configuration for all API calls
 * 
 * WHAT IT IS: A collection of settings that control how we connect to APIs
 * 
 * WHY WE NEED IT:
 * - Easy to change settings in one place
 * - Different environments (testing, production) can have different settings
 * - Keeps sensitive information separate from code
 */
const API_CONFIG = {
  // The base URL for our main API server
  // All API calls will start with this URL
  // Example: https://api.example.com/v1/tasks → tasks endpoint
  baseUrl: 'https://api.example.com/v1',
  
  // How long to wait for a response before giving up (in milliseconds)
  // 5000ms = 5 seconds - if the server doesn't respond in 5 seconds, we stop waiting
  timeout: 5000,
  
  // How many times to try again if a request fails
  // If the first attempt fails, we'll try up to 3 times total
  retries: 3
};

// ============================================================================
// HTTP HELPER FUNCTIONS
// ============================================================================
// HTTP (HyperText Transfer Protocol) is the language of the web.
// These functions handle the low-level details of making web requests.
// ============================================================================

/**
 * ----------------------------------------------------------------------------
 * httpRequest(url, options)
 * ----------------------------------------------------------------------------
 * 
 * WHAT IT DOES:
 * Sends a request to a server and receives a response.
 * This is the foundation function that all other API calls use.
 * 
 * WHY WE NEED IT:
 * Instead of writing the same error handling and configuration code
 * over and over, we write it once here and reuse it.
 * 
 * REAL-WORLD ANALOGY:
 * Think of this like making a phone call:
 * 1. You dial the number (set the URL)
 * 2. You choose what to say (set the method and body)
 * 3. You wait for a response
 * 4. If there's no answer or a bad connection, you handle it
 * 
 * HOW IT WORKS:
 * 1. Prepare the request with default settings
 * 2. Send the request using fetch()
 * 3. Check if the response is successful
 * 4. Parse the JSON data from the response
 * 5. Handle any errors that occur
 * 
 * @param {string} url - The web address to send the request to
 * @param {Object} options - Optional settings:
 *   - method: 'GET', 'POST', 'PUT', 'PATCH', 'DELETE' (default: 'GET')
 *   - headers: Additional headers to send
 *   - body: Data to send with the request (for POST/PUT/PATCH)
 * @returns {Promise<Object>} The response data as a JavaScript object
 * 
 * @example
 * // Simple GET request
 * const data = await httpRequest('https://api.example.com/tasks');
 * 
 * @example
 * // POST request with data
 * const result = await httpRequest('https://api.example.com/tasks', {
 *   method: 'POST',
 *   body: { title: 'New Task', priority: 'High' }
 * });
 */
async function httpRequest(url, options = {}) {
  // ----------------------------------------
  // STEP 1: Set up default options
  // ----------------------------------------
  // These are the baseline settings for every request
  // They can be overridden by passing options
  const defaultOptions = {
    method: 'GET',                          // Default HTTP method
    headers: {
      'Content-Type': 'application/json'    // Tell the server we're sending JSON
    },
    timeout: API_CONFIG.timeout             // Use our configured timeout
  };
  
  // Merge defaults with provided options
  // {...defaultOptions, ...options} means:
  // "Take defaultOptions, then overlay any properties from options"
  const finalOptions = { ...defaultOptions, ...options };
  
  // ----------------------------------------
  // STEP 2: Try to make the request
  // ----------------------------------------
  // try/catch is like a safety net - if something goes wrong,
  // we catch the error instead of crashing
  try {
    // fetch() is a built-in browser/Node.js function for making HTTP requests
    const response = await fetch(url, {
      method: finalOptions.method,
      headers: finalOptions.headers,
      // If body exists, convert JavaScript object to JSON string
      // JSON.stringify() turns { title: "Task" } into '{"title":"Task"}'
      body: finalOptions.body ? JSON.stringify(finalOptions.body) : undefined
    });
    
    // ----------------------------------------
    // STEP 3: Check if the request succeeded
    // ----------------------------------------
    // HTTP status codes:
    // 200-299: Success
    // 400-499: Client error (bad request)
    // 500-599: Server error
    if (!response.ok) {
      // response.ok is true only for status 200-299
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    // ----------------------------------------
    // STEP 4: Parse the response
    // ----------------------------------------
    // The response comes as JSON text, we convert it to a JavaScript object
    return await response.json();
    
  } catch (error) {
    // ----------------------------------------
    // STEP 5: Handle errors
    // ----------------------------------------
    // Log the error for debugging (developers can see what went wrong)
    console.error('API Request failed:', error.message);
    
    // Re-throw the error so the calling code can handle it
    throw error;
  }
}

// ============================================================================
// TASK API OPERATIONS
// ============================================================================
// These functions handle the basic CRUD operations for tasks.
// CRUD = Create, Read, Update, Delete - the four basic operations.
// ============================================================================

/**
 * ----------------------------------------------------------------------------
 * fetchAllTasks()
 * ----------------------------------------------------------------------------
 * 
 * WHAT IT DOES:
 * Retrieves ALL tasks from the server.
 * 
 * WHY WE NEED IT:
 * To display the task list to users, we need to get all tasks from the database.
 * 
 * REAL-WORLD ANALOGY:
 * Like going to the library and asking for "all books about gardening."
 * The librarian brings you the entire collection.
 * 
 * @returns {Promise<Array>} An array of task objects
 * 
 * @example
 * const tasks = await fetchAllTasks();
 * console.log(tasks);
 * // [{ id: 1, title: "Task 1" }, { id: 2, title: "Task 2" }]
 */
async function fetchAllTasks() {
  // GET request to the /tasks endpoint
  // The endpoint is like a specific page on a website
  return httpRequest(`${API_CONFIG.baseUrl}/tasks`);
}

/**
 * ----------------------------------------------------------------------------
 * fetchTaskById(taskId)
 * ----------------------------------------------------------------------------
 * 
 * WHAT IT DOES:
 * Retrieves a SINGLE task by its unique ID.
 * 
 * WHY WE NEED IT:
 * When a user clicks on a task to see details, we fetch just that one task.
 * This is more efficient than fetching all tasks and filtering.
 * 
 * REAL-WORLD ANALOGY:
 * Like looking up a book by its catalog number instead of browsing all shelves.
 * 
 * @param {number} taskId - The unique identifier of the task
 * @returns {Promise<Object>} A single task object
 * 
 * @example
 * const task = await fetchTaskById(42);
 * console.log(task);
 * // { id: 42, title: "Fix bug", status: "Todo" }
 */
async function fetchTaskById(taskId) {
  // Notice the URL includes the taskId: /tasks/42
  // This tells the server "give me task number 42"
  return httpRequest(`${API_CONFIG.baseUrl}/tasks/${taskId}`);
}

/**
 * ----------------------------------------------------------------------------
 * createTask(taskData)
 * ----------------------------------------------------------------------------
 * 
 * WHAT IT DOES:
 * Creates a NEW task on the server.
 * 
 * WHY WE NEED IT:
 * When a user fills out the "New Task" form and clicks save,
 * we send that data to the server to be stored in the database.
 * 
 * REAL-WORLD ANALOGY:
 * Like filling out a form and handing it to a clerk who files it away.
 * 
 * @param {Object} taskData - The task information to create
 *   Example: { title: "New Task", priority: "High", project_id: 1 }
 * @returns {Promise<Object>} The created task (usually includes the new ID)
 * 
 * @example
 * const newTask = await createTask({
 *   title: "Learn APIs",
 *   priority: "High",
 *   project_id: 1
 * });
 * console.log(newTask.id);  // The server assigned ID, e.g., 42
 */
async function createTask(taskData) {
  // POST means "create new data"
  // We send the taskData in the request body
  return httpRequest(`${API_CONFIG.baseUrl}/tasks`, {
    method: 'POST',
    body: taskData
  });
}

/**
 * ----------------------------------------------------------------------------
 * updateTask(taskId, updates)
 * ----------------------------------------------------------------------------
 * 
 * WHAT IT DOES:
 * Updates an EXISTING task with new information.
 * 
 * WHY WE NEED IT:
 * When a user edits a task (changes status, reassigns, etc.),
 * we send just the changed fields to the server.
 * 
 * REAL-WORLD ANALOGY:
 * Like correcting a typo on a form - you don't rewrite the whole form,
 * just fix the mistake.
 * 
 * @param {number} taskId - The ID of the task to update
 * @param {Object} updates - Only the fields that changed
 *   Example: { status: "Done" } (just changing status)
 * @returns {Promise<Object>} The updated task
 * 
 * @example
 * // Mark a task as done
 * await updateTask(42, { status: "Done" });
 */
async function updateTask(taskId, updates) {
  // PATCH means "partially update" (only change some fields)
  // PUT would mean "replace entirely" (not used as often)
  return httpRequest(`${API_CONFIG.baseUrl}/tasks/${taskId}`, {
    method: 'PATCH',
    body: updates
  });
}

/**
 * ----------------------------------------------------------------------------
 * deleteTask(taskId)
 * ----------------------------------------------------------------------------
 * 
 * WHAT IT DOES:
 * Permanently removes a task from the server.
 * 
 * WHY WE NEED IT:
 * When a user deletes a task, we remove it from the database.
 * 
 * ⚠️ WARNING: This is permanent - the data is gone forever!
 * 
 * REAL-WORLD ANALOGY:
 * Like shredding a document - once it's done, it can't be undone.
 * 
 * @param {number} taskId - The ID of the task to delete
 * @returns {Promise<boolean>} True if deletion succeeded
 * 
 * @example
 * await deleteTask(42);
 * console.log("Task 42 has been deleted");
 */
async function deleteTask(taskId) {
  // DELETE means "remove this resource"
  await httpRequest(`${API_CONFIG.baseUrl}/tasks/${taskId}`, {
    method: 'DELETE'
  });
  
  // Return true to signal success
  return true;
}

// ============================================================================
// WEBHOOK NOTIFICATIONS
// ============================================================================
// Webhooks are automated messages sent from apps when something happens.
// Think of them as "push notifications" between computers.
// ============================================================================

/**
 * ----------------------------------------------------------------------------
 * sendSlackNotification(webhookUrl, task, action)
 * ----------------------------------------------------------------------------
 * 
 * WHAT IT DOES:
 * Sends a notification message to a Slack channel.
 * 
 * WHY WE NEED IT:
 * Teams use Slack for communication. When important task events happen,
 * we want to notify the team automatically without manual messaging.
 * 
 * HOW WEBHOOKS WORK:
 * 1. You set up a webhook in Slack (they give you a special URL)
 * 2. When you send data to that URL, Slack posts a message
 * 3. Everyone in the channel sees the message
 * 
 * REAL-WORLD ANALOGY:
 * Like a PA system in a store: "Attention shoppers, sale in aisle 5!"
 * One announcement, everyone hears it.
 * 
 * @param {string} webhookUrl - The Slack webhook URL (from Slack app settings)
 * @param {Object} task - The task object that triggered the notification
 * @param {string} action - What happened: 'created', 'updated', 'completed'
 * @returns {Promise<Object>} Slack's response
 * 
 * @example
 * await sendSlackNotification(
 *   'https://hooks.slack.com/services/XXX/YYY/ZZZ',
 *   { title: "Fix bug", priority: "Critical" },
 *   'created'
 * );
 * // Posts to Slack: "Task created - Fix bug (Priority: Critical)"
 */
async function sendSlackNotification(webhookUrl, task, action) {
  // Build the Slack message in their required format
  // Slack uses "blocks" to format messages nicely
  const message = {
    // The main text (shown in notifications)
    text: `Task ${action}`,
    
    // Rich formatting blocks
    blocks: [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',  // Markdown formatting
          // *text* makes it bold in Slack
          text: `*${task.title}*\nPriority: ${task.priority} | Status: ${task.status}`
        }
      }
    ]
  };
  
  // Send to Slack's webhook URL
  return httpRequest(webhookUrl, {
    method: 'POST',
    body: message
  });
}

/**
 * ----------------------------------------------------------------------------
 * sendTeamsNotification(webhookUrl, task, action)
 * ----------------------------------------------------------------------------
 * 
 * WHAT IT DOES:
 * Sends a notification message to a Microsoft Teams channel.
 * 
 * WHY WE NEED IT:
 * Many organizations use Microsoft Teams instead of Slack.
 * This function does the same thing but in Teams format.
 * 
 * @param {string} webhookUrl - The Teams webhook URL
 * @param {Object} task - The task object
 * @param {string} action - What happened
 * @returns {Promise<Object>} Teams' response
 * 
 * @example
 * await sendTeamsNotification(webhookUrl, task, 'completed');
 */
async function sendTeamsNotification(webhookUrl, task, action) {
  // Microsoft Teams uses a different message format called "MessageCard"
  const message = {
    '@type': 'MessageCard',                    // Required for Teams
    '@context': 'http://schema.org/extensions', // Required for Teams
    themeColor: '0076D7',                       // Blue color for the card
    summary: `Task ${action}`,                  // Shown in notifications
    
    // Sections are like paragraphs in the message
    sections: [{
      activityTitle: `Task ${action}`,
      
      // Facts are displayed as a table of key-value pairs
      facts: [
        { name: 'Title', value: task.title },
        { name: 'Priority', value: task.priority },
        { name: 'Status', value: task.status }
      ],
      
      markdown: true  // Allow markdown formatting
    }]
  };
  
  return httpRequest(webhookUrl, {
    method: 'POST',
    body: message
  });
}

// ============================================================================
// EMAIL NOTIFICATIONS (via API)
// ============================================================================
// These functions send emails through an email service like SendGrid, Mailgun, etc.
// ============================================================================

/**
 * ----------------------------------------------------------------------------
 * sendTaskAssignmentEmail(emailConfig, task, assignee)
 * ----------------------------------------------------------------------------
 * 
 * WHAT IT DOES:
 * Sends an email to notify someone they've been assigned a task.
 * 
 * WHY WE NEED IT:
 * Not everyone checks the task app constantly.
 * Email notifications ensure people know about new assignments.
 * 
 * REAL-WORLD ANALOGY:
 * Like a boss sending a memo to an employee: "You've been assigned to Project X."
 * 
 * @param {Object} emailConfig - Email service settings:
 *   - apiUrl: The email service's API URL
 *   - apiKey: Authentication key (like a password for the API)
 * @param {Object} task - The assigned task
 * @param {Object} assignee - The person assigned (must have email property)
 * @returns {Promise<Object>} Email service response
 * 
 * @example
 * await sendTaskAssignmentEmail(
 *   { apiUrl: 'https://api.sendgrid.com', apiKey: 'key123' },
 *   { title: "Fix bug", priority: "High" },
 *   { name: "John", email: "john@example.com" }
 * );
 */
async function sendTaskAssignmentEmail(emailConfig, task, assignee) {
  // Build the email data structure
  const emailData = {
    to: assignee.email,                        // Recipient
    subject: `New Task Assigned: ${task.title}`, // Email subject line
    body: `
Hi ${assignee.name},

You have been assigned a new task:

Title: ${task.title}
Priority: ${task.priority}
Due Date: ${task.due_date || 'Not set'}

Please log in to view the full details.

Best regards,
Task Management System
    `.trim()  // Remove extra whitespace
  };
  
  // Send the email through the email service API
  return httpRequest(`${emailConfig.apiUrl}/send`, {
    method: 'POST',
    
    // Headers include authentication
    // Bearer token is like showing your ID badge
    headers: {
      'Authorization': `Bearer ${emailConfig.apiKey}`,
      'Content-Type': 'application/json'
    },
    body: emailData
  });
}

// ============================================================================
// EXTERNAL SERVICE INTEGRATIONS
// ============================================================================
// These functions connect to other popular services that teams use.
// ============================================================================

/**
 * ----------------------------------------------------------------------------
 * createCalendarEvent(calendarConfig, task)
 * ----------------------------------------------------------------------------
 * 
 * WHAT IT DOES:
 * Creates a calendar event for a task deadline.
 * 
 * WHY WE NEED IT:
 * Tasks have due dates. By syncing with Google Calendar or Outlook,
 * users can see their deadlines alongside other appointments.
 * 
 * REAL-WORLD ANALOGY:
 * Like writing an appointment in your day planner - you won't forget
 * because it's written down.
 * 
 * @param {Object} calendarConfig - Calendar API settings
 * @param {Object} task - The task to create an event for
 * @returns {Promise<Object>} The created calendar event
 * 
 * @example
 * await createCalendarEvent(
 *   { apiUrl: 'https://www.googleapis.com/calendar/v3', accessToken: 'token123' },
 *   { title: "Project deadline", due_date: "2026-06-10" }
 * );
 */
async function createCalendarEvent(calendarConfig, task) {
  // Build the calendar event in Google Calendar format
  const eventData = {
    summary: `Task: ${task.title}`,           // Event title
    description: task.description || '',       // Event description
    
    // Start and end dates
    // For all-day events, use 'date' instead of 'dateTime'
    start: {
      date: task.due_date
    },
    end: {
      date: task.due_date
    },
    
    // Reminders to notify before the event
    reminders: {
      useDefault: false,                       // Don't use default reminders
      overrides: [
        { method: 'email', minutes: 24 * 60 }, // Email 1 day before (1440 minutes)
        { method: 'popup', minutes: 60 }       // Popup 1 hour before
      ]
    }
  };
  
  // Send to Google Calendar API
  return httpRequest(`${calendarConfig.apiUrl}/calendar/events`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${calendarConfig.accessToken}`
    },
    body: eventData
  });
}

/**
 * ----------------------------------------------------------------------------
 * logTimeEntry(timeConfig, task, hoursSpent)
 * ----------------------------------------------------------------------------
 * 
 * WHAT IT DOES:
 * Records how much time was spent on a task.
 * 
 * WHY WE NEED IT:
 * Organizations often need to track time for billing, reporting, or analysis.
 * This sends time data to a time tracking service like Toggl or Harvest.
 * 
 * REAL-WORLD ANALOGY:
 * Like a timesheet where you write "2 hours on Project X."
 * 
 * @param {Object} timeConfig - Time tracking API settings
 * @param {Object} task - The completed task
 * @param {number} hoursSpent - Hours worked on this task
 * @returns {Promise<Object>} The created time entry
 * 
 * @example
 * await logTimeEntry(
 *   { apiUrl: 'https://api.harvestapp.com/v2', apiKey: 'key123' },
 *   { id: 42, title: "Fix bug", project_id: 1 },
 *   2.5  // 2.5 hours spent
 * );
 */
async function logTimeEntry(timeConfig, task, hoursSpent) {
  // Build the time entry data
  const timeEntry = {
    task_id: task.id,
    project_id: task.project_id,
    hours: hoursSpent,
    description: `Completed: ${task.title}`,
    
    // Today's date in ISO format (YYYY-MM-DD)
    // new Date() creates a date object for right now
    // .toISOString() converts to string like "2026-06-03T10:30:00.000Z"
    // .split('T')[0] takes just the date part "2026-06-03"
    date: new Date().toISOString().split('T')[0]
  };
  
  // Send to time tracking API
  return httpRequest(`${timeConfig.apiUrl}/time-entries`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${timeConfig.apiKey}`
    },
    body: timeEntry
  });
}

// ============================================================================
// WEBHOOK HANDLERS (for receiving data)
// ============================================================================
// Sometimes EXTERNAL services send US data.
// These functions process incoming webhook data.
// ============================================================================

/**
 * ----------------------------------------------------------------------------
 * handleExternalWebhook(payload)
 * ----------------------------------------------------------------------------
 * 
 * WHAT IT DOES:
 * Processes data received from external services via webhook.
 * 
 * WHY WE NEED IT:
 * External apps might send us information that should create or update tasks.
 * For example, a form builder might send form submissions as new tasks.
 * 
 * HOW IT WORKS:
 * 1. External service sends a POST request to our webhook URL
 * 2. We receive the payload (data)
 * 3. We determine what action to take based on the event type
 * 4. We return instructions for what to do
 * 
 * REAL-WORLD ANALOGY:
 * Like a mailroom clerk who sorts incoming mail:
 * - Bills go to accounting
 * - Packages go to recipients
 * - Junk mail goes to trash
 * 
 * @param {Object} payload - The incoming webhook data
 *   Expected structure: { event: "event.type", data: { ... } }
 * @returns {Object} Instructions for what action to take
 * 
 * @example
 * // Incoming webhook from a form service
 * const result = handleExternalWebhook({
 *   event: 'form.submitted',
 *   data: { form_title: "Bug Report", form_data: { description: "..." } }
 * });
 * // Returns: { action: 'create_task', taskData: { title: "Bug Report", ... } }
 */
function handleExternalWebhook(payload) {
  // In a real application, you would verify the webhook signature
  // This ensures the request is actually from the expected service
  // (Not a hacker trying to send fake data)
  // const isValid = verifyWebhookSignature(payload);
  // if (!isValid) throw new Error('Invalid webhook signature');
  
  // Destructure the payload
  // This extracts 'event' and 'data' from payload
  // Equivalent to: const event = payload.event; const data = payload.data;
  const { event, data } = payload;
  
  // Use a switch statement to handle different event types
  // Think of it like a train switchyard - different trains go to different tracks
  switch (event) {
    case 'form.submitted':
      // A form was submitted somewhere, create a task from it
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
      // An external system marked a task as complete
      // Sync our local record
      return {
        action: 'update_task',
        taskId: data.task_id,
        updates: {
          status: 'Done',
          completed_at: new Date().toISOString()
        }
      };
      
    default:
      // Unknown event type - ignore it
      return { action: 'ignored', reason: 'Unknown event type' };
  }
}

// ============================================================================
// BATCH OPERATIONS
// ============================================================================
// Sometimes we need to process many items at once.
// These functions handle bulk operations efficiently.
// ============================================================================

/**
 * ----------------------------------------------------------------------------
 * syncTasksWithExternal(localTasks, externalApiUrl)
 * ----------------------------------------------------------------------------
 * 
 * WHAT IT DOES:
 * Synchronizes tasks between our local system and an external system.
 * 
 * WHY WE NEED IT:
 * Organizations often use multiple systems. This ensures both systems
 * have the same data - like syncing contacts between your phone and computer.
 * 
 * HOW IT WORKS:
 * 1. Go through each local task
 * 2. If it has an external_id, UPDATE the external record
 * 3. If it doesn't have an external_id, CREATE a new external record
 * 4. Track successes and failures
 * 
 * REAL-WORLD ANALOGY:
 * Like reconciling two bank statements - you go line by line,
 * matching and updating until both show the same information.
 * 
 * @param {Array} localTasks - Array of local task objects
 * @param {string} externalApiUrl - URL of the external system's API
 * @returns {Promise<Object>} Sync results:
 *   - created: number of new tasks created externally
 *   - updated: number of existing tasks updated
 *   - errors: array of any errors that occurred
 * 
 * @example
 * const results = await syncTasksWithExternal(localTasks, 'https://external.com/api');
 * console.log(`Created ${results.created}, Updated ${results.updated}`);
 */
async function syncTasksWithExternal(localTasks, externalApiUrl) {
  // Initialize results tracking
  const results = {
    created: 0,     // Count of newly created tasks
    updated: 0,     // Count of updated existing tasks
    errors: []      // List of any errors encountered
  };
  
  // Loop through each task
  // for...of allows us to use await inside the loop
  for (const task of localTasks) {
    try {
      // Check if this task already exists in the external system
      const externalId = task.external_id;
      
      if (externalId) {
        // ----------------------------------------
        // UPDATE existing record
        // ----------------------------------------
        // PUT replaces the entire record
        await httpRequest(`${externalApiUrl}/tasks/${externalId}`, {
          method: 'PUT',
          body: task
        });
        results.updated++;
        
      } else {
        // ----------------------------------------
        // CREATE new record
        // ----------------------------------------
        const response = await httpRequest(`${externalApiUrl}/tasks`, {
          method: 'POST',
          body: task
        });
        
        // Store the external ID for future syncs
        // This lets us update instead of create next time
        task.external_id = response.id;
        results.created++;
      }
      
    } catch (error) {
      // If anything goes wrong with this task, record the error
      // But continue processing other tasks
      results.errors.push({
        taskId: task.id,
        error: error.message
      });
    }
  }
  
  return results;
}

// ============================================================================
// EXPORTS
// ============================================================================
// Make all functions available to other files.
// ============================================================================

module.exports = {
  // HTTP helper
  httpRequest,
  
  // Task CRUD operations
  fetchAllTasks,
  fetchTaskById,
  createTask,
  updateTask,
  deleteTask,
  
  // Notification functions
  sendSlackNotification,
  sendTeamsNotification,
  sendTaskAssignmentEmail,
  
  // External service integrations
  createCalendarEvent,
  logTimeEntry,
  
  // Webhook handling
  handleExternalWebhook,
  
  // Batch operations
  syncTasksWithExternal
};
