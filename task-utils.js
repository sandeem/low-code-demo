/**
 * ============================================================================
 * TASK UTILITIES - JavaScript Helper Functions
 * ============================================================================
 * 
 * WHAT THIS FILE DOES:
 * This file contains "utility functions" - small pieces of code that perform
 * specific tasks. Think of these as tools in a toolbox, each designed for
 * a specific job.
 * 
 * WHY THIS MATTERS:
 * - Provides reusable code (write once, use many times)
 * - Keeps code organized and maintainable
 * - Handles common operations that the app needs frequently
 * 
 * RELATIONSHIP TO THE WHOLE APP:
 * While data-model.js is the FOUNDATION, this file is the MECHANICS.
 * These functions process and manipulate the data defined in data-model.js.
 * The API file (api-integration.js) uses these functions to prepare data
 * before sending it to external services.
 * 
 * KEY CONCEPTS:
 * - Function: A reusable block of code that performs a specific task
 * - Parameter: Input data the function needs to work
 * - Return: The output/result the function produces
 */

// ============================================================================
// PRIORITY MANAGEMENT
// ============================================================================
// These functions handle task priorities - how urgent/important a task is.
// Priorities determine which tasks should be done first.
// ============================================================================

/**
 * ----------------------------------------------------------------------------
 * getPriorityScore(priority)
 * ----------------------------------------------------------------------------
 * 
 * WHAT IT DOES:
 * Converts a priority word (like "High") into a number (like 3).
 * This makes it easy to compare and sort tasks by priority.
 * 
 * WHY WE NEED IT:
 * Computers are better at comparing numbers than words. By converting
 * "Critical" to 4 and "Low" to 1, we can easily say "4 > 1" (Critical is
 * more important than Low).
 * 
 * REAL-WORLD ANALOGY:
 * Like a school grading system where A=4, B=3, C=2, D=1, F=0.
 * It's easier to say "4 points" than "an A grade" when calculating GPA.
 * 
 * @param {string} priority - The priority level as a word
 *                            Must be one of: 'Critical', 'High', 'Medium', 'Low'
 * @returns {number} The priority as a number (4, 3, 2, or 1)
 *                   Returns 0 if the priority is unknown/invalid
 * 
 * EXAMPLE USAGE:
 * getPriorityScore('Critical')  // Returns 4
 * getPriorityScore('Medium')    // Returns 2
 * getPriorityScore('Unknown')   // Returns 0 (invalid priority)
 */
function getPriorityScore(priority) {
  // This is an OBJECT - think of it as a lookup table or dictionary
  // On the left: the priority word, On the right: the number value
  const scores = {
    'Critical': 4,   // Highest urgency - must do immediately
    'High': 3,       // Very important - do soon
    'Medium': 2,     // Normal importance - do when possible
    'Low': 1         // Not urgent - can wait
  };
  
  // Look up the priority in our table
  // If found, return the number; if not found, return 0
  // The "|| 0" means "if scores[priority] is undefined, use 0 instead"
  return scores[priority] || 0;
}

/**
 * ----------------------------------------------------------------------------
 * getPriorityColor(priority)
 * ----------------------------------------------------------------------------
 * 
 * WHAT IT DOES:
 * Returns the CSS class name for a given priority level.
 * CSS classes control how elements look (colors, fonts, etc.)
 * 
 * WHY WE NEED IT:
 * Visual feedback helps users quickly identify urgent tasks.
 * Red = Critical (attention needed!)
 * Orange = High (important)
 * Yellow = Medium (normal)
 * Green = Low (relaxed)
 * 
 * REAL-WORLD ANALOGY:
 * Like traffic lights - red means stop (urgent), green means go (relaxed).
 * 
 * @param {string} priority - The priority level
 * @returns {string} The CSS class name to apply styling
 * 
 * EXAMPLE USAGE:
 * getPriorityColor('Critical')  // Returns 'priority-critical'
 * // In the CSS file, .priority-critical has red background
 */
function getPriorityColor(priority) {
  // Map each priority to its visual style (CSS class)
  const colors = {
    'Critical': 'priority-critical',  // Red styling - urgent!
    'High': 'priority-high',          // Orange styling - important
    'Medium': 'priority-medium',      // Yellow styling - normal
    'Low': 'priority-low'             // Green styling - relaxed
  };
  
  // Return the CSS class, or 'priority-default' if unknown
  return colors[priority] || 'priority-default';
}

// ============================================================================
// DATE & DEADLINE UTILITIES
// ============================================================================
// These functions handle dates and deadlines - calculating how much time
// is left, whether tasks are overdue, and displaying friendly date messages.
// ============================================================================

/**
 * ----------------------------------------------------------------------------
 * isOverdue(dueDate, status)
 * ----------------------------------------------------------------------------
 * 
 * WHAT IT DOES:
 * Checks if a task is past its due date AND not yet completed.
 * 
 * WHY WE NEED IT:
 * We need to alert users when tasks are overdue so they can take action.
 * A completed task should never be marked as overdue, even if it was
 * finished after the due date.
 * 
 * REAL-WORLD ANALOGY:
 * Like checking if a library book is late. Even if the due date passed,
 * if you already returned it, it's not "overdue" anymore.
 * 
 * @param {string} dueDate - The task's due date in 'YYYY-MM-DD' format
 *                           Example: '2026-06-05' means June 5, 2026
 * @param {string} status - The current status of the task
 * @returns {boolean} True if the task is overdue, False otherwise
 *                    (boolean means it's either true or false, nothing else)
 * 
 * EXAMPLE USAGE:
 * // Today is June 3, 2026
 * isOverdue('2026-06-01', 'Todo')        // Returns true (past due, not done)
 * isOverdue('2026-06-05', 'Todo')        // Returns false (not past due yet)
 * isOverdue('2026-06-01', 'Done')        // Returns false (already completed)
 */
function isOverdue(dueDate, status) {
  // First, check if the task is already completed
  // Completed tasks are never considered overdue
  const completedStatuses = ['Done', 'Cancelled'];
  
  // .includes() checks if 'status' is in our list of completed statuses
  if (completedStatuses.includes(status)) {
    return false;  // Not overdue if already done or cancelled
  }
  
  // Get today's date
  const today = new Date();
  // Reset the time to midnight (00:00:00) so we only compare dates, not times
  today.setHours(0, 0, 0, 0);
  
  // Convert the due date string to a Date object
  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);
  
  // Compare the two dates
  // If 'due' is earlier than 'today', the task is overdue
  return due < today;
}

/**
 * ----------------------------------------------------------------------------
 * getDaysRemaining(dueDate)
 * ----------------------------------------------------------------------------
 * 
 * WHAT IT DOES:
 * Calculates how many days are left until the due date.
 * 
 * WHY WE NEED IT:
 * Helps users see at a glance how much time they have.
 * Positive number = days remaining
 * Negative number = days overdue
 * 
 * REAL-WORLD ANALOGY:
 * Like a countdown timer. "3 days left" or "2 days late".
 * 
 * @param {string} dueDate - The due date in 'YYYY-MM-DD' format
 * @returns {number} Days remaining (positive) or days overdue (negative)
 * 
 * EXAMPLE USAGE:
 * // Today is June 3, 2026
 * getDaysRemaining('2026-06-05')  // Returns 2 (two days left)
 * getDaysRemaining('2026-06-01')  // Returns -2 (two days late)
 * getDaysRemaining('2026-06-03')  // Returns 0 (due today)
 */
function getDaysRemaining(dueDate) {
  // Get today's date at midnight
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Get the due date at midnight
  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);
  
  // Calculate the difference in milliseconds
  const diffTime = due - today;
  
  // Convert milliseconds to days
  // 1000 milliseconds = 1 second
  // 60 seconds = 1 minute
  // 60 minutes = 1 hour
  // 24 hours = 1 day
  // So: 1000 * 60 * 60 * 24 = milliseconds in one day
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
}

/**
 * ----------------------------------------------------------------------------
 * getDeadlineStatus(dueDate, status)
 * ----------------------------------------------------------------------------
 * 
 * WHAT IT DOES:
 * Creates a human-friendly message about the task deadline.
 * Instead of showing raw dates, it says things like "Due today!" or "3 days left".
 * 
 * WHY WE NEED IT:
 * Users prefer friendly messages over technical dates.
 * "Due tomorrow" is more helpful than seeing "2026-06-04".
 * 
 * REAL-WORLD ANALOGY:
 * Like a helpful assistant who says "Don't forget, this is due tomorrow!"
 * instead of just handing you a calendar.
 * 
 * @param {string} dueDate - The due date in 'YYYY-MM-DD' format
 * @param {string} status - The current task status
 * @returns {string} A friendly message about the deadline
 * 
 * EXAMPLE USAGE:
 * // Today is June 3, 2026
 * getDeadlineStatus('2026-06-05', 'Todo')     // Returns "📅 Due in 2 days"
 * getDeadlineStatus('2026-06-03', 'Todo')     // Returns "🔥 Due today!"
 * getDeadlineStatus('2026-06-01', 'Todo')     // Returns "⚠️ Overdue by 2 day(s)"
 * getDeadlineStatus('2026-06-05', 'Done')     // Returns "✅ Completed"
 */
function getDeadlineStatus(dueDate, status) {
  // First, handle completed tasks
  if (['Done', 'Cancelled'].includes(status)) {
    return '✅ Completed';
  }
  
  // Calculate days remaining
  const days = getDaysRemaining(dueDate);
  
  // Return appropriate message based on days remaining
  // We use emoji icons to make the message more visual
  
  if (days < 0) {
    // Negative days means overdue
    // Math.abs() converts negative to positive (e.g., -2 becomes 2)
    return `⚠️ Overdue by ${Math.abs(days)} day(s)`;
  } else if (days === 0) {
    // Due today!
    return '🔥 Due today!';
  } else if (days === 1) {
    // Due tomorrow
    return '⏰ Due tomorrow';
  } else if (days <= 7) {
    // Due within a week
    return `📅 Due in ${days} days`;
  } else {
    // Due in more than a week
    return `📅 Due in ${days} days`;
  }
}

// ============================================================================
// TASK VALIDATION
// ============================================================================
// Validation means checking if data is correct before processing it.
// These functions ensure tasks have all required information and no errors.
// ============================================================================

/**
 * ----------------------------------------------------------------------------
 * validateTask(task)
 * ----------------------------------------------------------------------------
 * 
 * WHAT IT DOES:
 * Checks if a task has all required information and follows the rules.
 * Returns a list of any problems found.
 * 
 * WHY WE NEED IT:
 * Bad data causes bugs and confusion. By validating before saving,
 * we catch problems early and show helpful error messages to users.
 * 
 * REAL-WORLD ANALOGY:
 * Like a form validator at a bank. Before processing your application,
 * they check: Is your name filled in? Is your email valid? Did you sign?
 * If anything is missing, they tell you what to fix.
 * 
 * @param {Object} task - The task object to validate
 *                        An Object is like a container that holds related data
 *                        Example: { title: "Fix bug", priority: "High" }
 * @returns {Object} Result object with:
 *   - valid: boolean (true if no errors)
 *   - errors: array of error messages (empty if valid)
 * 
 * EXAMPLE USAGE:
 * validateTask({ title: "", project_id: 1 })
 * // Returns: { valid: false, errors: ["Task title is required"] }
 * 
 * validateTask({ title: "Fix bug", project_id: 1 })
 * // Returns: { valid: true, errors: [] }
 */
function validateTask(task) {
  // Start with an empty list of errors
  // We'll add to this list as we find problems
  const errors = [];
  
  // ----------------------------------------
  // VALIDATION 1: Title is required
  // ----------------------------------------
  // Check if title exists and is not just whitespace
  if (!task.title || task.title.trim() === '') {
    errors.push('Task title is required');
  }
  
  // ----------------------------------------
  // VALIDATION 2: Project is required
  // ----------------------------------------
  // Every task must belong to a project
  if (!task.project_id) {
    errors.push('Project must be selected');
  }
  
  // ----------------------------------------
  // VALIDATION 3: Title length limit
  // ----------------------------------------
  // Even if title exists, it shouldn't be too long
  // The && means "and" - both conditions must be true
  if (task.title && task.title.length > 200) {
    errors.push('Task title must be 200 characters or less');
  }
  
  // ----------------------------------------
  // VALIDATION 4: Date logic
  // ----------------------------------------
  // Due date shouldn't be before start date
  if (task.due_date && task.start_date) {
    const due = new Date(task.due_date);
    const start = new Date(task.start_date);
    if (due < start) {
      errors.push('Due date cannot be before start date');
    }
  }
  
  // Return the validation result
  // valid is true if errors array is empty (length === 0)
  return {
    valid: errors.length === 0,
    errors: errors
  };
}

// ============================================================================
// TASK SORTING & FILTERING
// ============================================================================
// These functions organize tasks - putting them in order or finding specific ones.
// Like sorting a deck of cards or finding all the red cards.
// ============================================================================

/**
 * ----------------------------------------------------------------------------
 * sortByPriority(tasks)
 * ----------------------------------------------------------------------------
 * 
 * WHAT IT DOES:
 * Arranges tasks so the highest priority ones come first.
 * 
 * WHY WE NEED IT:
 * Users want to see their most urgent tasks at the top of the list.
 * This makes it easy to focus on what's important.
 * 
 * REAL-WORLD ANALOGY:
 * Like organizing your mail - you put urgent bills at the top of the pile,
 * and junk mail at the bottom.
 * 
 * @param {Array} tasks - An array (list) of task objects
 * @returns {Array} A new array with tasks sorted by priority (highest first)
 * 
 * EXAMPLE USAGE:
 * const tasks = [
 *   { title: "Task A", priority: "Low" },
 *   { title: "Task B", priority: "Critical" },
 *   { title: "Task C", priority: "Medium" }
 * ];
 * sortByPriority(tasks);
 * // Returns: [Task B (Critical), Task C (Medium), Task A (Low)]
 */
function sortByPriority(tasks) {
  // [...tasks] creates a copy of the array
  // We copy because we don't want to change the original array
  // .sort() rearranges items based on our comparison
  return [...tasks].sort((a, b) => {
    // Compare priority scores
    // b - a means higher scores come first (descending order)
    // a - b would mean lower scores come first (ascending order)
    return getPriorityScore(b.priority) - getPriorityScore(a.priority);
  });
}

/**
 * ----------------------------------------------------------------------------
 * sortByDueDate(tasks)
 * ----------------------------------------------------------------------------
 * 
 * WHAT IT DOES:
 * Arranges tasks so the ones due soonest come first.
 * 
 * WHY WE NEED IT:
 * When deadlines matter, users want to see what's due next.
 * This helps them plan their work.
 * 
 * REAL-WORLD ANALOGY:
 * Like organizing homework assignments by due date - the one due tomorrow
 * goes on top, the one due next week goes below.
 * 
 * @param {Array} tasks - Array of task objects
 * @returns {Array} Tasks sorted by due date (earliest first)
 * 
 * EXAMPLE USAGE:
 * sortByDueDate(tasks);
 * // Tasks with sooner due dates appear first
 */
function sortByDueDate(tasks) {
  return [...tasks].sort((a, b) => {
    // Convert dates to Date objects for comparison
    // If no due date, use a far future date so it sorts last
    const dateA = new Date(a.due_date || '9999-12-31');
    const dateB = new Date(b.due_date || '9999-12-31');
    
    // dateA - dateB means earlier dates come first (ascending order)
    return dateA - dateB;
  });
}

/**
 * ----------------------------------------------------------------------------
 * filterByStatus(tasks, status)
 * ----------------------------------------------------------------------------
 * 
 * WHAT IT DOES:
 * Finds all tasks that match a specific status.
 * 
 * WHY WE NEED IT:
 * Users often want to see just "Todo" tasks, or just "Done" tasks.
 * Filtering hides the irrelevant ones.
 * 
 * REAL-WORLD ANALOGY:
 * Like using a strainer in the kitchen - you pour in mixed vegetables,
 * and only the small pieces fall through. The filter keeps what you want.
 * 
 * @param {Array} tasks - Array of task objects
 * @param {string} status - The status to filter by (e.g., "Todo", "Done")
 * @returns {Array} Only the tasks that match the status
 * 
 * EXAMPLE USAGE:
 * filterByStatus(tasks, "Todo");
 * // Returns only tasks where status === "Todo"
 */
function filterByStatus(tasks, status) {
  // .filter() goes through each item and keeps only the ones
  // where the condition is true
  return tasks.filter(task => task.status === status);
}

/**
 * ----------------------------------------------------------------------------
 * filterByAssignee(tasks, assigneeId)
 * ----------------------------------------------------------------------------
 * 
 * WHAT IT DOES:
 * Finds all tasks assigned to a specific person.
 * 
 * WHY WE NEED IT:
 * Team members want to see only their own tasks, not everyone else's.
 * 
 * REAL-WORLD ANALOGY:
 * Like a teacher sorting homework by student name - each student gets
 * only their own papers.
 * 
 * @param {Array} tasks - Array of task objects
 * @param {number} assigneeId - The ID of the user to filter by
 * @returns {Array} Only the tasks assigned to that user
 * 
 * EXAMPLE USAGE:
 * filterByAssignee(tasks, 3);
 * // Returns only tasks where assignee_id === 3
 */
function filterByAssignee(tasks, assigneeId) {
  return tasks.filter(task => task.assignee_id === assigneeId);
}

// ============================================================================
// TASK STATISTICS
// ============================================================================
// Statistics are calculations that summarize data - like "average" or "total".
// These functions provide overview information about tasks.
// ============================================================================

/**
 * ----------------------------------------------------------------------------
 * calculateTaskStats(tasks)
 * ----------------------------------------------------------------------------
 * 
 * WHAT IT DOES:
 * Calculates summary numbers about a set of tasks.
 * 
 * WHY WE NEED IT:
 * Users want to see the big picture: "How many tasks total?"
 * "How many are done?" "What's my completion rate?"
 * 
 * REAL-WORLD ANALOGY:
 * Like a sports scoreboard showing: total points, fouls, time remaining.
 * It's a quick summary of the game's current state.
 * 
 * @param {Array} tasks - Array of task objects
 * @returns {Object} Statistics object with:
 *   - total: number of tasks
 *   - completed: number of done tasks
 *   - inProgress: number of in-progress tasks
 *   - overdue: number of overdue tasks
 *   - completionRate: percentage done (0-100)
 * 
 * EXAMPLE USAGE:
 * calculateTaskStats(tasks);
 * // Returns: { total: 10, completed: 4, inProgress: 3, overdue: 2, completionRate: 40 }
 */
function calculateTaskStats(tasks) {
  // Count total tasks
  const total = tasks.length;
  
  // Count completed tasks using .filter()
  // .length gives us the count
  const completed = tasks.filter(t => t.status === 'Done').length;
  
  // Count in-progress tasks
  const inProgress = tasks.filter(t => t.status === 'In Progress').length;
  
  // Count overdue tasks using our isOverdue function
  const overdue = tasks.filter(t => isOverdue(t.due_date, t.status)).length;
  
  // Calculate completion rate as percentage
  // If total is 0, use 0% to avoid division by zero error
  // Math.round() rounds to nearest whole number
  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
  
  // Return all statistics as one object
  return {
    total,
    completed,
    inProgress,
    overdue,
    completionRate
  };
}

/**
 * ----------------------------------------------------------------------------
 * getTaskSummary(task)
 * ----------------------------------------------------------------------------
 * 
 * WHAT IT DOES:
 * Creates a text summary of a task - useful for notifications and displays.
 * 
 * WHY WE NEED IT:
 * When sending notifications (email, Slack), we need a formatted message
 * that includes all the important task information.
 * 
 * REAL-WORLD ANALOGY:
 * Like a movie synopsis - a brief summary that tells you the key points
 * without having to watch the whole movie.
 * 
 * @param {Object} task - A task object
 * @returns {string} A formatted text summary
 * 
 * EXAMPLE USAGE:
 * getTaskSummary({ title: "Fix bug", priority: "High", status: "Todo", due_date: "2026-06-05" });
 * // Returns:
 * // "Task: Fix bug
 * //  Priority: High
 * //  Status: Todo
 * //  Deadline: 📅 Due in 2 days"
 */
function getTaskSummary(task) {
  // Get the friendly deadline status
  const status = getDeadlineStatus(task.due_date, task.status);
  
  // Build a multi-line string using template literals (backticks)
  // ${variable} inserts the variable's value into the string
  return `
Task: ${task.title}
Priority: ${task.priority}
Status: ${task.status}
Deadline: ${status}
  `.trim();  // .trim() removes extra whitespace at start and end
}

// ============================================================================
// WORKFLOW AUTOMATION
// ============================================================================
// Workflow means the sequence of steps a task goes through.
// These functions help automate task progression and suggestions.
// ============================================================================

/**
 * ----------------------------------------------------------------------------
 * getNextStatus(currentStatus)
 * ----------------------------------------------------------------------------
 * 
 * WHAT IT DOES:
 * Determines what the next status should be based on current status.
 * 
 * WHY WE NEED IT:
 * Tasks follow a logical flow: Todo → In Progress → Review → Done
 * This function suggests the next step automatically.
 * 
 * REAL-WORLD ANALOGY:
 * Like a recipe - after you finish step 1, you automatically go to step 2.
 * The workflow is the recipe that tasks follow.
 * 
 * @param {string} currentStatus - The task's current status
 * @returns {string} The recommended next status
 * 
 * EXAMPLE USAGE:
 * getNextStatus('Todo');         // Returns 'In Progress'
 * getNextStatus('In Progress');  // Returns 'Review'
 * getNextStatus('Done');         // Returns 'Done' (already finished)
 */
function getNextStatus(currentStatus) {
  // Define the workflow as a mapping
  // Left side: current status, Right side: next status
  const workflow = {
    'Todo': 'In Progress',       // Start working on it
    'In Progress': 'Review',     // Done, needs review
    'Review': 'Done',            // Review complete
    'Blocked': 'In Progress',    // Unblock and continue
    'Done': 'Done',              // Terminal state - no change
    'Cancelled': 'Cancelled'     // Terminal state - no change
  };
  
  // Return the next status, or keep current if unknown
  return workflow[currentStatus] || currentStatus;
}

/**
 * ----------------------------------------------------------------------------
 * suggestPriority(dueDate)
 * ----------------------------------------------------------------------------
 * 
 * WHAT IT DOES:
 * Automatically suggests a priority level based on how soon the task is due.
 * 
 * WHY WE NEED IT:
 * Not all users know how to prioritize. This helps by suggesting based on
 * urgency - tasks due soon get higher priority.
 * 
 * REAL-WORLD ANALOGY:
 * Like a GPS that suggests the fastest route. It looks at traffic and
 * distance to recommend the best option.
 * 
 * @param {string} dueDate - The task's due date
 * @returns {string} A suggested priority level
 * 
 * EXAMPLE USAGE:
 * // Today is June 3, 2026
 * suggestPriority('2026-06-04');  // Returns 'Critical' (due tomorrow)
 * suggestPriority('2026-06-10');  // Returns 'Medium' (due in a week)
 * suggestPriority('2026-07-01');  // Returns 'Low' (due in a month)
 */
function suggestPriority(dueDate) {
  // Calculate days remaining
  const days = getDaysRemaining(dueDate);
  
  // Suggest priority based on urgency
  if (days <= 1) return 'Critical';    // Due today or tomorrow
  if (days <= 3) return 'High';        // Due within 3 days
  if (days <= 7) return 'Medium';      // Due within a week
  return 'Low';                         // Due later than a week
}

// ============================================================================
// EXPORTS
// ============================================================================
// This section makes our functions available to other files.
// Think of it as putting tools in a toolbox that others can access.
// ============================================================================

// module.exports is how Node.js shares code between files
// Other files can: const taskUtils = require('./task-utils.js')
// Then use: taskUtils.getPriorityScore('High')
module.exports = {
  // Priority functions
  getPriorityScore,
  getPriorityColor,
  
  // Date functions
  isOverdue,
  getDaysRemaining,
  getDeadlineStatus,
  
  // Validation function
  validateTask,
  
  // Sorting and filtering functions
  sortByPriority,
  sortByDueDate,
  filterByStatus,
  filterByAssignee,
  
  // Statistics functions
  calculateTaskStats,
  getTaskSummary,
  
  // Workflow functions
  getNextStatus,
  suggestPriority
};
