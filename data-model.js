/**
 * Data Model - Entity Definitions & Relationships
 * 
 * This file demonstrates understanding of relational data design,
 * entity relationships, and field logic as required for low-code platforms.
 */

// ============================================
// ENTITY DEFINITIONS
// ============================================

/**
 * User Entity
 * Represents a person who can be assigned tasks or own projects
 */
const UserEntity = {
  name: 'User',
  fields: {
    id: { type: 'auto_number', primary: true },
    name: { type: 'text', required: true, maxLength: 100 },
    email: { type: 'email', required: true, unique: true },
    role: { type: 'select', options: ['Admin', 'Manager', 'Member'], default: 'Member' },
    created_at: { type: 'timestamp', autoCreate: true },
    is_active: { type: 'boolean', default: true }
  },
  
  // Relationship: One user can own many projects
  relationships: {
    owned_projects: { type: 'one_to_many', target: 'Project', foreignKey: 'owner_id' },
    assigned_tasks: { type: 'one_to_many', target: 'Task', foreignKey: 'assignee_id' }
  }
};

/**
 * Project Entity
 * A container for related tasks with milestones
 */
const ProjectEntity = {
  name: 'Project',
  fields: {
    id: { type: 'auto_number', primary: true },
    name: { type: 'text', required: true, maxLength: 200 },
    description: { type: 'text_area', maxLength: 1000 },
    status: { 
      type: 'select', 
      options: ['Planning', 'Active', 'On Hold', 'Completed', 'Cancelled'],
      default: 'Planning'
    },
    owner_id: { type: 'number', reference: 'User.id' },
    start_date: { type: 'date' },
    target_end_date: { type: 'date' },
    created_at: { type: 'timestamp', autoCreate: true }
  },
  
  // Relationships
  relationships: {
    owner: { type: 'many_to_one', target: 'User', foreignKey: 'owner_id' },
    tasks: { type: 'one_to_many', target: 'Task', foreignKey: 'project_id' },
    milestones: { type: 'one_to_many', target: 'Milestone', foreignKey: 'project_id' }
  },
  
  // Field Logic: Calculate project progress
  fieldLogic: {
    progress: {
      type: 'formula',
      calculation: 'COUNT(tasks WHERE status = "Done") / COUNT(tasks) * 100'
    },
    is_overdue: {
      type: 'formula',
      calculation: 'target_end_date < TODAY() AND status != "Completed"'
    }
  }
};

/**
 * Task Entity
 * Individual work items within a project
 */
const TaskEntity = {
  name: 'Task',
  fields: {
    id: { type: 'auto_number', primary: true },
    title: { type: 'text', required: true, maxLength: 200 },
    description: { type: 'text_area', maxLength: 2000 },
    status: {
      type: 'select',
      options: ['Todo', 'In Progress', 'Review', 'Done', 'Blocked'],
      default: 'Todo'
    },
    priority: {
      type: 'select',
      options: ['Low', 'Medium', 'High', 'Critical'],
      default: 'Medium'
    },
    assignee_id: { type: 'number', reference: 'User.id' },
    project_id: { type: 'number', reference: 'Project.id', required: true },
    due_date: { type: 'date' },
    completed_at: { type: 'timestamp' },
    created_at: { type: 'timestamp', autoCreate: true }
  },
  
  // Relationships
  relationships: {
    project: { type: 'many_to_one', target: 'Project', foreignKey: 'project_id' },
    assignee: { type: 'many_to_one', target: 'User', foreignKey: 'assignee_id' },
    comments: { type: 'one_to_many', target: 'Comment', foreignKey: 'task_id' }
  },
  
  // Field Logic
  fieldLogic: {
    is_overdue: {
      type: 'formula',
      calculation: 'due_date < TODAY() AND status NOT IN ["Done", "Cancelled"]'
    },
    days_until_due: {
      type: 'formula',
      calculation: 'DATEDIFF(due_date, TODAY(), "days")'
    }
  }
};

/**
 * Comment Entity
 * Discussion threads on tasks
 */
const CommentEntity = {
  name: 'Comment',
  fields: {
    id: { type: 'auto_number', primary: true },
    task_id: { type: 'number', reference: 'Task.id', required: true },
    user_id: { type: 'number', reference: 'User.id', required: true },
    content: { type: 'text_area', required: true, maxLength: 2000 },
    created_at: { type: 'timestamp', autoCreate: true }
  },
  
  relationships: {
    task: { type: 'many_to_one', target: 'Task', foreignKey: 'task_id' },
    user: { type: 'many_to_one', target: 'User', foreignKey: 'user_id' }
  }
};

/**
 * Milestone Entity
 * Key checkpoints within a project
 */
const MilestoneEntity = {
  name: 'Milestone',
  fields: {
    id: { type: 'auto_number', primary: true },
    project_id: { type: 'number', reference: 'Project.id', required: true },
    name: { type: 'text', required: true, maxLength: 150 },
    target_date: { type: 'date', required: true },
    status: {
      type: 'select',
      options: ['Upcoming', 'In Progress', 'Completed', 'Missed'],
      default: 'Upcoming'
    }
  },
  
  relationships: {
    project: { type: 'many_to_one', target: 'Project', foreignKey: 'project_id' }
  }
};

// ============================================
// SAMPLE DATA
// ============================================

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
  { id: 3, title: 'Fix login bug', status: 'Done', priority: 'Critical', project_id: 1, assignee_id: 3, due_date: '2026-06-03' }
];

// ============================================
// EXPORTS
// ============================================

module.exports = {
  entities: {
    User: UserEntity,
    Project: ProjectEntity,
    Task: TaskEntity,
    Comment: CommentEntity,
    Milestone: MilestoneEntity
  },
  sampleData: {
    users: sampleUsers,
    projects: sampleProjects,
    tasks: sampleTasks
  }
};
