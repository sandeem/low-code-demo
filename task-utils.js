/**
 * ============================================================================
 * TASK UTILITIES - JavaScript Helper Functions
 * ============================================================================
 * 
 * This file contains utility functions for task management.
 * Works in both Node.js AND browsers.
 */

// ============================================================================
// PRIORITY MANAGEMENT
// ============================================================================

function getPriorityScore(priority) {
  const scores = { 'Critical': 4, 'High': 3, 'Medium': 2, 'Low': 1 };
  return scores[priority] || 0;
}

function getPriorityColor(priority) {
  const colors = { 'Critical': 'priority-critical', 'High': 'priority-high', 'Medium': 'priority-medium', 'Low': 'priority-low' };
  return colors[priority] || 'priority-default';
}

// ============================================================================
// DATE & DEADLINE UTILITIES
// ============================================================================

function isOverdue(dueDate, status) {
  const completedStatuses = ['Done', 'Cancelled'];
  if (completedStatuses.includes(status)) return false;
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);
  
  return due < today;
}

function getDaysRemaining(dueDate) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);
  
  const diffTime = due - today;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

function getDeadlineStatus(dueDate, status) {
  if (['Done', 'Cancelled'].includes(status)) return '✅ Completed';
  
  const days = getDaysRemaining(dueDate);
  
  if (days < 0) return `⚠️ Overdue by ${Math.abs(days)} day(s)`;
  if (days === 0) return '🔥 Due today!';
  if (days === 1) return '⏰ Due tomorrow';
  return `📅 Due in ${days} days`;
}

// ============================================================================
// TASK VALIDATION
// ============================================================================

function validateTask(task) {
  const errors = [];
  
  if (!task.title || task.title.trim() === '') {
    errors.push('Task title is required');
  }
  
  if (!task.project_id) {
    errors.push('Project must be selected');
  }
  
  if (task.title && task.title.length > 200) {
    errors.push('Task title must be 200 characters or less');
  }
  
  if (task.due_date && task.start_date) {
    const due = new Date(task.due_date);
    const start = new Date(task.start_date);
    if (due < start) {
      errors.push('Due date cannot be before start date');
    }
  }
  
  return { valid: errors.length === 0, errors: errors };
}

// ============================================================================
// TASK SORTING & FILTERING
// ============================================================================

function sortByPriority(tasks) {
  return [...tasks].sort((a, b) => {
    return getPriorityScore(b.priority) - getPriorityScore(a.priority);
  });
}

function sortByDueDate(tasks) {
  return [...tasks].sort((a, b) => {
    const dateA = new Date(a.due_date || '9999-12-31');
    const dateB = new Date(b.due_date || '9999-12-31');
    return dateA - dateB;
  });
}

function filterByStatus(tasks, status) {
  return tasks.filter(task => task.status === status);
}

function filterByAssignee(tasks, assigneeId) {
  return tasks.filter(task => task.assignee_id === assigneeId);
}

// ============================================================================
// TASK STATISTICS
// ============================================================================

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

function getTaskSummary(task) {
  const status = getDeadlineStatus(task.due_date, task.status);
  return `Task: ${task.title}\nPriority: ${task.priority}\nStatus: ${task.status}\nDeadline: ${status}`;
}

// ============================================================================
// WORKFLOW AUTOMATION
// ============================================================================

function getNextStatus(currentStatus) {
  const workflow = {
    'Todo': 'In Progress',
    'In Progress': 'Review',
    'Review': 'Done',
    'Blocked': 'In Progress',
    'Done': 'Done',
    'Cancelled': 'Cancelled'
  };
  
  return workflow[currentStatus] || currentStatus;
}

function suggestPriority(dueDate) {
  const days = getDaysRemaining(dueDate);
  
  if (days <= 1) return 'Critical';
  if (days <= 3) return 'High';
  if (days <= 7) return 'Medium';
  return 'Low';
}

// ============================================================================
// MAKE AVAILABLE GLOBALLY (for browser and Node.js)
// ============================================================================

// For browsers: attach to window object
if (typeof window !== 'undefined') {
  window.TaskUtils = {
    getPriorityScore,
    getPriorityColor,
    isOverdue,
    getDaysRemaining,
    getDeadlineStatus,
    validateTask,
    sortByPriority,
    sortByDueDate,
    filterByStatus,
    filterByAssignee,
    calculateTaskStats,
    getTaskSummary,
    getNextStatus,
    suggestPriority
  };
}

// For Node.js: export as module
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    getPriorityScore,
    getPriorityColor,
    isOverdue,
    getDaysRemaining,
    getDeadlineStatus,
    validateTask,
    sortByPriority,
    sortByDueDate,
    filterByStatus,
    filterByAssignee,
    calculateTaskStats,
    getTaskSummary,
    getNextStatus,
    suggestPriority
  };
}
