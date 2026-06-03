/**
 * ============================================================================
 * DATA MODEL - Entity Definitions & Relationships
 * ============================================================================
 * 
 * This file defines the data structures for our task management app.
 * Works in both Node.js AND browsers.
 */

// ============================================================================
// SAMPLE DATA
// ============================================================================

const sampleUsers = [
  { id: 1, name: 'John Smith', email: 'john@example.com', role: 'Manager' },
  { id: 2, name: 'Sarah Johnson', email: 'sarah@example.com', role: 'Member' },
  { id: 3, name: 'Mike Chen', email: 'mike@example.com', role: 'Member' }
];

const sampleProjects = [
  { id: 1, name: 'Website Redesign', status: 'Active', owner_id: 1 },
  { id: 2, name: 'Mobile App Development', status: 'Planning', owner_id: 2 }
];

const sampleTasks = [
  { id: 1, title: 'Design homepage mockup', status: 'In Progress', priority: 'High', project_id: 1, assignee_id: 1, due_date: '2026-06-05' },
  { id: 2, title: 'Review API documentation', status: 'Todo', priority: 'Medium', project_id: 2, assignee_id: 2, due_date: '2026-06-07' },
  { id: 3, title: 'Fix login bug', status: 'Done', priority: 'Critical', project_id: 1, assignee_id: 3, due_date: '2026-06-01' },
  { id: 4, title: 'Write unit tests', status: 'Review', priority: 'Medium', project_id: 1, assignee_id: 1, due_date: '2026-06-10' },
  { id: 5, title: 'Deploy to staging', status: 'Todo', priority: 'Low', project_id: 2, assignee_id: 2, due_date: '2026-06-15' },
  { id: 6, title: 'Security audit', status: 'Blocked', priority: 'Critical', project_id: 1, assignee_id: 3, due_date: '2026-06-04' }
];

// ============================================================================
// ENTITY DEFINITIONS (for documentation/reference)
// ============================================================================

const entities = {
  User: {
    name: 'User',
    fields: {
      id: { type: 'auto_number', primary: true },
      name: { type: 'text', required: true, maxLength: 100 },
      email: { type: 'email', required: true, unique: true },
      role: { type: 'select', options: ['Admin', 'Manager', 'Member'], default: 'Member' },
      created_at: { type: 'timestamp', autoCreate: true },
      is_active: { type: 'boolean', default: true }
    }
  },
  Project: {
    name: 'Project',
    fields: {
      id: { type: 'auto_number', primary: true },
      name: { type: 'text', required: true, maxLength: 200 },
      status: { type: 'select', options: ['Planning', 'Active', 'On Hold', 'Completed', 'Cancelled'], default: 'Planning' },
      owner_id: { type: 'number', reference: 'User.id' }
    }
  },
  Task: {
    name: 'Task',
    fields: {
      id: { type: 'auto_number', primary: true },
      title: { type: 'text', required: true, maxLength: 200 },
      status: { type: 'select', options: ['Todo', 'In Progress', 'Review', 'Done', 'Blocked'], default: 'Todo' },
      priority: { type: 'select', options: ['Low', 'Medium', 'High', 'Critical'], default: 'Medium' },
      assignee_id: { type: 'number', reference: 'User.id' },
      project_id: { type: 'number', reference: 'Project.id', required: true },
      due_date: { type: 'date' }
    }
  }
};

// ============================================================================
// HELPER: Get user by ID
// ============================================================================

function getUserById(userId) {
  return sampleUsers.find(user => user.id === userId) || null;
}

function getProjectById(projectId) {
  return sampleProjects.find(project => project.id === projectId) || null;
}

function getAssigneeName(assigneeId) {
  const user = getUserById(assigneeId);
  return user ? user.name : 'Unassigned';
}

// ============================================================================
// MAKE AVAILABLE GLOBALLY (for browser and Node.js)
// ============================================================================

// For browsers: attach to window object
if (typeof window !== 'undefined') {
  window.DataModel = {
    sampleUsers,
    sampleProjects,
    sampleTasks,
    entities,
    getUserById,
    getProjectById,
    getAssigneeName
  };
}

// For Node.js: export as module
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    sampleUsers,
    sampleProjects,
    sampleTasks,
    entities,
    getUserById,
    getProjectById,
    getAssigneeName
  };
}
