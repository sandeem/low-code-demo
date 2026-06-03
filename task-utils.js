/**
 * Task Utilities - JavaScript Helper Functions
 * 
 * This file demonstrates JavaScript skills for extending low-code platforms
 * beyond their visual builder capabilities.
 */

// ============================================
// PRIORITY MANAGEMENT
// ============================================

/**
 * Convert priority text to numeric score for sorting
 * @param {string} priority - Priority level (Low, Medium, High, Critical)
 * @returns {number} Numeric score (1-4)
 */
function getPriorityScore(priority) {
  const scores = {
    'Critical': 4,
    'High': 3,
    'Medium': 2,
    'Low': 1
  };
  return scores[priority] || 0;
}

/**
 * Get priority badge color for UI display
 * @param {string} priority - Priority level
 * @returns {string} CSS color class
 */
function getPriorityColor(priority) {
  const colors = {
    'Critical': 'priority-critical',  // Red
    'High': 'priority-high',          // Orange
    'Medium': 'priority-medium',      // Yellow
    'Low': 'priority-low'             // Green
  };
  return colors[priority] || 'priority-default';
}

// ============================================
// DATE & DEADLINE UTILITIES
// ============================================

/**
 * Check if a task is overdue
 * @param {string} dueDate - Due date string (YYYY-MM-DD)
 * @param {string} status - Current task status
 * @returns {boolean} True if task is overdue
 */
function isOverdue(dueDate, status) {
  // Completed tasks are never overdue
  const completedStatuses = ['Done', 'Cancelled'];
  if (completedStatuses.includes(status)) {
    return false;
  }
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);
  
  return due < today;
}

/**
 * Calculate days remaining until deadline
 * @param {string} dueDate - Due date string (YYYY-MM-DD)
 * @returns {number} Days remaining (negative if overdue)
 */
function getDaysRemaining(dueDate) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);
  
  const diffTime = due - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
}

/**
 * Get human-readable deadline status
 * @param {string} dueDate - Due date string
 * @param {string} status - Task status
 * @returns {string} Human-readable status message
 */
function getDeadlineStatus(dueDate, status) {
  if (['Done', 'Cancelled'].includes(status)) {
    return '✅ Completed';
  }
  
  const days = getDaysRemaining(dueDate);
  
  if (days < 0) {
    return `⚠️ Overdue by ${Math.abs(days)} day(s)`;
  } else if (days === 0) {
    return '🔥 Due today!';
  } else if (days === 1) {
    return '⏰ Due tomorrow';
  } else if (days <= 7) {
    return `📅 Due in ${days} days`;
  } else {
    return `📅 Due in ${days} days`;
  }
}

// ============================================
// TASK VALIDATION
// ============================================

/**
 * Validate task data before saving
 * @param {Object} task - Task object to validate
 * @returns {Object} Validation result { valid: boolean, errors: string[] }
 */
function validateTask(task) {
  const errors = [];
  
  // Required fields
  if (!task.title || task.title.trim() === '') {
    errors.push('Task title is required');
  }
  
  if (!task.project_id) {
    errors.push('Project must be selected');
  }
  
  // Title length
  if (task.title && task.title.length > 200) {
    errors.push('Task title must be 200 characters or less');
  }
  
  // Date validation
  if (task.due_date && task.start_date) {
    const due = new Date(task.due_date);
    const start = new Date(task.start_date);
    if (due < start) {
      errors.push('Due date cannot be before start date');
    }
  }
  
  return {
    valid: errors.length === 0,
    errors: errors
  };
}

// ============================================
// TASK SORTING & FILTERING
// ============================================

/**
 * Sort tasks by priority (highest first)
 * @param {Array} tasks - Array of task objects
 * @returns {Array} Sorted tasks
 */
function sortByPriority(tasks) {
  return [...tasks].sort((a, b) => {
    return getPriorityScore(b.priority) - getPriorityScore(a.priority);
  });
}

/**
 * Sort tasks by due date (earliest first)
 * @param {Array} tasks - Array of task objects
 * @returns {Array} Sorted tasks
 */
function sortByDueDate(tasks) {
  return [...tasks].sort((a, b) => {
    const dateA = new Date(a.due_date || '9999-12-31');
    const dateB = new Date(b.due_date || '9999-12-31');
    return dateA - dateB;
  });
}

/**
 * Filter tasks by status
 * @param {Array} tasks - Array of task objects
 * @param {string} status - Status to filter by
 * @returns {Array} Filtered tasks
 */
function filterByStatus(tasks, status) {
  return tasks.filter(task => task.status === status);
}

/**
 * Filter tasks by assignee
 * @param {Array} tasks - Array of task objects
 * @param {number} assigneeId - Assignee ID to filter by
 * @returns {Array} Filtered tasks
 */
function filterByAssignee(tasks, assigneeId) {
  return tasks.filter(task => task.assignee_id === assigneeId);
}

// ============================================
// TASK STATISTICS
// ============================================

/**
 * Calculate task statistics for a project
 * @param {Array} tasks - Array of task objects
 * @returns {Object} Statistics object
 */
function calculateTaskStats(tasks) {
  const total = tasks.length;
  const completed = tasks.filter(t => t.status === 'Done').length;
  const inProgress = tasks.filter(t => t.status === 'In Progress').length;
  const overdue = tasks.filter(t => isOverdue(t.due_date, t.status)).length;
  
  return {
    total,
    completed,
    inProgress,
    overdue,
    completionRate: total > 0 ? Math.round((completed / total) * 100) : 0
  };
}

/**
 * Generate task summary text
 * @param {Object} task - Task object
 * @returns {string} Formatted summary
 */
function getTaskSummary(task) {
  const status = getDeadlineStatus(task.due_date, task.status);
  return `
Task: ${task.title}
Priority: ${task.priority}
Status: ${task.status}
Deadline: ${status}
  `.trim();
}

// ============================================
// WORKFLOW AUTOMATION
// ============================================

/**
 * Determine next status in workflow
 * @param {string} currentStatus - Current task status
 * @returns {string} Next recommended status
 */
function getNextStatus(currentStatus) {
  const workflow = {
    'Todo': 'In Progress',
    'In Progress': 'Review',
    'Review': 'Done',
    'Blocked': 'In Progress',
    'Done': 'Done',  // Terminal state
    'Cancelled': 'Cancelled'  // Terminal state
  };
  
  return workflow[currentStatus] || currentStatus;
}

/**
 * Auto-assign priority based on due date
 * @param {string} dueDate - Due date string
 * @returns {string} Suggested priority
 */
function suggestPriority(dueDate) {
  const days = getDaysRemaining(dueDate);
  
  if (days <= 1) return 'Critical';
  if (days <= 3) return 'High';
  if (days <= 7) return 'Medium';
  return 'Low';
}

// ============================================
// EXPORTS
// ============================================

module.exports = {
  // Priority
  getPriorityScore,
  getPriorityColor,
  
  // Dates
  isOverdue,
  getDaysRemaining,
  getDeadlineStatus,
  
  // Validation
  validateTask,
  
  // Sorting & Filtering
  sortByPriority,
  sortByDueDate,
  filterByStatus,
  filterByAssignee,
  
  // Statistics
  calculateTaskStats,
  getTaskSummary,
  
  // Workflow
  getNextStatus,
  suggestPriority
};
