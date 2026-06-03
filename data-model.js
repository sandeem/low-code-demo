/**
 * ============================================================================
 * DATA MODEL - Entity Definitions & Relationships
 * ============================================================================
 * 
 * WHAT THIS FILE DOES:
 * This file defines the "blueprints" for our data - like architectural plans
 * for a building. It describes what information we store and how different
 * pieces of information connect to each other.
 * 
 * WHY THIS MATTERS:
 * - Organizes data in a logical way (like folders in a filing cabinet)
 * - Shows relationships between different types of data
 * - Makes the application scalable and maintainable
 * 
 * RELATIONSHIP TO THE WHOLE APP:
 * Think of this as the FOUNDATION of a house. Other files (task-utils.js,
 * api-integration.js) build on top of these data structures. Without this
 * foundation, the app wouldn't know how to store or organize information.
 * 
 * KEY CONCEPTS:
 * - Entity: A "thing" we want to store data about (User, Task, Project)
 * - Field: A piece of information about that thing (name, email, status)
 * - Relationship: How entities connect (a User OWNS many Projects)
 */

// ============================================================================
// ENTITY DEFINITIONS
// ============================================================================
// An "Entity" is like a form template - it defines what information we collect
// for each type of thing in our application.
// ============================================================================

/**
 * ----------------------------------------------------------------------------
 * USER ENTITY
 * ----------------------------------------------------------------------------
 * 
 * WHAT IT IS: A person who uses our application
 * 
 * REAL-WORLD ANALOGY: Think of an employee ID card. Each card has:
 * - A unique ID number (nobody else has the same number)
 * - Name of the employee
 * - Email to contact them
 * - Role (manager, staff, etc.)
 * 
 * RELATIONSHIP TO APP: Users are the people who:
 * - Create and own projects
 * - Get assigned to tasks
 * - Write comments
 */
const UserEntity = {
  // The name we use to refer to this entity in code
  name: 'User',
  
  // FIELDS: These are the pieces of information we store about each user
  // Think of each field as a blank on a form that needs to be filled in
  fields: {
    // id: A unique number automatically assigned to each user
    // Like a social security number - every person has a different one
    id: { 
      type: 'auto_number',  // The system creates this number automatically
      primary: true          // This is the main way we identify a user
    },
    
    // name: The user's full name
    // Required means they MUST provide this - can't be left blank
    name: { 
      type: 'text',          // Regular text (letters, spaces, etc.)
      required: true,        // Mandatory field
      maxLength: 100         // Can't be longer than 100 characters
    },
    
    // email: The user's email address
    // Used for notifications and login
    email: { 
      type: 'email',         // Must be a valid email format (xxx@xxx.com)
      required: true,        // Mandatory field
      unique: true           // No two users can have the same email
    },
    
    // role: What level of access the user has
    // This controls what they can do in the app
    role: { 
      type: 'select',        // Choose from a dropdown list
      options: ['Admin', 'Manager', 'Member'],  // The available choices
      default: 'Member'      // If not specified, they become a Member
    },
    
    // created_at: When this user account was created
    // Useful for reports and account management
    created_at: { 
      type: 'timestamp',     // Stores date AND time
      autoCreate: true       // System automatically sets this when created
    },
    
    // is_active: Whether the user account is active or disabled
    // Used to deactivate users without deleting their data
    is_active: { 
      type: 'boolean',       // True or False only
      default: true          // New users are active by default
    }
  },
  
  // RELATIONSHIPS: How User connects to other entities
  // This is like a family tree showing how people are related
  relationships: {
    // A user can OWN multiple projects (one-to-many relationship)
    // Example: John owns the "Website Redesign" project AND the "Mobile App" project
    owned_projects: { 
      type: 'one_to_many',      // One user → many projects
      target: 'Project',        // Connected to the Project entity
      foreignKey: 'owner_id'    // The Project has an "owner_id" field pointing to User
    },
    
    // A user can be ASSIGNED to multiple tasks
    // Example: Sarah is assigned to "Design logo" and "Write documentation"
    assigned_tasks: { 
      type: 'one_to_many',      // One user → many tasks
      target: 'Task',           // Connected to the Task entity
      foreignKey: 'assignee_id' // The Task has an "assignee_id" field pointing to User
    }
  }
};

/**
 * ----------------------------------------------------------------------------
 * PROJECT ENTITY
 * ----------------------------------------------------------------------------
 * 
 * WHAT IT IS: A container for related tasks with a common goal
 * 
 * REAL-WORLD ANALOGY: Think of a project as a folder containing related documents.
 * The "Website Redesign" project folder contains tasks like:
 * - "Design homepage"
 * - "Fix navigation menu"
 * - "Update footer"
 * 
 * RELATIONSHIP TO APP: Projects:
 * - Group related tasks together
 * - Have an owner (the person responsible)
 * - Have milestones (checkpoints along the way)
 */
const ProjectEntity = {
  name: 'Project',
  
  fields: {
    // id: Unique identifier for the project
    id: { 
      type: 'auto_number', 
      primary: true 
    },
    
    // name: The project's name (e.g., "Website Redesign")
    name: { 
      type: 'text', 
      required: true,        // Every project must have a name
      maxLength: 200 
    },
    
    // description: Detailed explanation of what the project is about
    description: { 
      type: 'text_area',     // Multi-line text (longer than regular text)
      maxLength: 1000 
    },
    
    // status: What phase the project is in
    status: { 
      type: 'select', 
      options: ['Planning', 'Active', 'On Hold', 'Completed', 'Cancelled'],
      default: 'Planning'    // New projects start in "Planning" phase
    },
    
    // owner_id: Which user owns this project
    // This is a REFERENCE - it points to a User's id
    owner_id: { 
      type: 'number', 
      reference: 'User.id'   // Links to the User entity's id field
    },
    
    // start_date: When the project officially begins
    start_date: { 
      type: 'date'           // Stores just the date (no time)
    },
    
    // target_end_date: When we hope to finish the project
    target_end_date: { 
      type: 'date' 
    },
    
    // created_at: When this project record was created in the system
    created_at: { 
      type: 'timestamp', 
      autoCreate: true 
    }
  },
  
  // RELATIONSHIPS: How Project connects to other entities
  relationships: {
    // Each project has ONE owner (many-to-one relationship)
    // Multiple projects can have the same owner
    owner: { 
      type: 'many_to_one',   // Many projects → one user
      target: 'User', 
      foreignKey: 'owner_id' 
    },
    
    // A project contains MANY tasks
    tasks: { 
      type: 'one_to_many',   // One project → many tasks
      target: 'Task', 
      foreignKey: 'project_id' 
    },
    
    // A project has MANY milestones (checkpoints)
    milestones: { 
      type: 'one_to_many',   // One project → many milestones
      target: 'Milestone', 
      foreignKey: 'project_id' 
    }
  },
  
  // FIELD LOGIC: Calculated values (formulas)
  // These are like Excel formulas - they calculate automatically
  fieldLogic: {
    // progress: What percentage of tasks are complete?
    // Example: If a project has 10 tasks and 4 are done, progress = 40%
    progress: {
      type: 'formula',
      calculation: 'COUNT(tasks WHERE status = "Done") / COUNT(tasks) * 100'
      // Translation: Count completed tasks, divide by total tasks, multiply by 100
    },
    
    // is_overdue: Is the project past its deadline but not completed?
    is_overdue: {
      type: 'formula',
      calculation: 'target_end_date < TODAY() AND status != "Completed"'
      // Translation: Target date is in the past AND status is not "Completed"
    }
  }
};

/**
 * ----------------------------------------------------------------------------
 * TASK ENTITY
 * ----------------------------------------------------------------------------
 * 
 * WHAT IT IS: A specific piece of work that needs to be done
 * 
 * REAL-WORLD ANALOGY: Think of a task as an item on a to-do list.
 * Each item has:
 * - A description of what to do
 * - A priority (high, medium, low)
 * - A due date
 * - A status (not started, in progress, done)
 * 
 * RELATIONSHIP TO APP: Tasks are the CORE of the application.
 * Everything revolves around managing tasks:
 * - Assigning them to people
 * - Tracking their progress
 * - Notifying when they're due
 */
const TaskEntity = {
  name: 'Task',
  
  fields: {
    // id: Unique identifier for the task
    id: { 
      type: 'auto_number', 
      primary: true 
    },
    
    // title: A short name for the task
    // Example: "Fix login bug" or "Design homepage mockup"
    title: { 
      type: 'text', 
      required: true,        // Every task MUST have a title
      maxLength: 200 
    },
    
    // description: Detailed explanation of what the task involves
    description: { 
      type: 'text_area', 
      maxLength: 2000 
    },
    
    // status: What stage the task is in
    status: {
      type: 'select',
      options: ['Todo', 'In Progress', 'Review', 'Done', 'Blocked'],
      // Todo = hasn't started yet
      // In Progress = currently being worked on
      // Review = done but needs approval
      // Done = completely finished
      // Blocked = can't proceed due to some issue
      default: 'Todo'
    },
    
    // priority: How urgent/important the task is
    priority: {
      type: 'select',
      options: ['Low', 'Medium', 'High', 'Critical'],
      // Low = not urgent, can wait
      // Medium = normal importance
      // High = needs attention soon
      // Critical = urgent, must be done immediately
      default: 'Medium'
    },
    
    // assignee_id: Which user is responsible for this task
    // Points to a User's id
    assignee_id: { 
      type: 'number', 
      reference: 'User.id' 
    },
    
    // project_id: Which project this task belongs to
    // Points to a Project's id
    project_id: { 
      type: 'number', 
      reference: 'Project.id', 
      required: true         // Every task MUST belong to a project
    },
    
    // due_date: When the task should be completed by
    due_date: { 
      type: 'date' 
    },
    
    // completed_at: When the task was marked as "Done"
    // This is empty until the task is completed
    completed_at: { 
      type: 'timestamp' 
    },
    
    // created_at: When this task was created
    created_at: { 
      type: 'timestamp', 
      autoCreate: true 
    }
  },
  
  // RELATIONSHIPS
  relationships: {
    // Each task belongs to ONE project
    project: { 
      type: 'many_to_one', 
      target: 'Project', 
      foreignKey: 'project_id' 
    },
    
    // Each task can have ONE assigned user
    assignee: { 
      type: 'many_to_one', 
      target: 'User', 
      foreignKey: 'assignee_id' 
    },
    
    // A task can have MANY comments (discussion thread)
    comments: { 
      type: 'one_to_many', 
      target: 'Comment', 
      foreignKey: 'task_id' 
    }
  },
  
  // FIELD LOGIC: Automatic calculations
  fieldLogic: {
    // is_overdue: Is this task past its due date but not done?
    is_overdue: {
      type: 'formula',
      calculation: 'due_date < TODAY() AND status NOT IN ["Done", "Cancelled"]'
      // Translation: Due date is in the past AND status is not Done or Cancelled
    },
    
    // days_until_due: How many days until the deadline?
    days_until_due: {
      type: 'formula',
      calculation: 'DATEDIFF(due_date, TODAY(), "days")'
      // Translation: Calculate the difference between due date and today
    }
  }
};

/**
 * ----------------------------------------------------------------------------
 * COMMENT ENTITY
 * ----------------------------------------------------------------------------
 * 
 * WHAT IT IS: A message or note attached to a task
 * 
 * REAL-WORLD ANALOGY: Think of sticky notes attached to a document.
 * Team members can leave comments to:
 * - Ask questions about the task
 * - Provide updates on progress
 * - Share relevant information
 * 
 * RELATIONSHIP TO APP: Comments enable:
 * - Communication between team members
 * - Task history tracking
 * - Questions and answers about tasks
 */
const CommentEntity = {
  name: 'Comment',
  
  fields: {
    // id: Unique identifier for the comment
    id: { 
      type: 'auto_number', 
      primary: true 
    },
    
    // task_id: Which task this comment is attached to
    task_id: { 
      type: 'number', 
      reference: 'Task.id', 
      required: true 
    },
    
    // user_id: Who wrote this comment
    user_id: { 
      type: 'number', 
      reference: 'User.id', 
      required: true 
    },
    
    // content: The actual text of the comment
    content: { 
      type: 'text_area', 
      required: true,        // A comment must have text
      maxLength: 2000 
    },
    
    // created_at: When the comment was posted
    created_at: { 
      type: 'timestamp', 
      autoCreate: true 
    }
  },
  
  relationships: {
    // Each comment belongs to ONE task
    task: { 
      type: 'many_to_one', 
      target: 'Task', 
      foreignKey: 'task_id' 
    },
    
    // Each comment is written by ONE user
    user: { 
      type: 'many_to_one', 
      target: 'User', 
      foreignKey: 'user_id' 
    }
  }
};

/**
 * ----------------------------------------------------------------------------
 * MILESTONE ENTITY
 * ----------------------------------------------------------------------------
 * 
 * WHAT IT IS: A checkpoint or important date in a project
 * 
 * REAL-WORLD ANALOGY: Think of milestones as mile markers on a highway.
 * They show you've reached important points in your journey.
 * Example milestones for a "Build a House" project:
 * - Foundation complete (March 1)
 * - Framing complete (April 1)
 * - Roof installed (April 15)
 * - Final inspection (May 1)
 * 
 * RELATIONSHIP TO APP: Milestones help:
 * - Track project progress
 * - Set intermediate goals
 * - Identify if a project is on schedule
 */
const MilestoneEntity = {
  name: 'Milestone',
  
  fields: {
    // id: Unique identifier for the milestone
    id: { 
      type: 'auto_number', 
      primary: true 
    },
    
    // project_id: Which project this milestone belongs to
    project_id: { 
      type: 'number', 
      reference: 'Project.id', 
      required: true 
    },
    
    // name: What this milestone represents
    // Example: "Beta Release" or "User Testing Complete"
    name: { 
      type: 'text', 
      required: true, 
      maxLength: 150 
    },
    
    // target_date: When we plan to reach this milestone
    target_date: { 
      type: 'date', 
      required: true 
    },
    
    // status: What state the milestone is in
    status: {
      type: 'select',
      options: ['Upcoming', 'In Progress', 'Completed', 'Missed'],
      // Upcoming = hasn't started yet
      // In Progress = currently working toward it
      // Completed = reached the milestone
      // Missed = passed the target date without completing
      default: 'Upcoming'
    }
  },
  
  relationships: {
    // Each milestone belongs to ONE project
    project: { 
      type: 'many_to_one', 
      target: 'Project', 
      foreignKey: 'project_id' 
    }
  }
};

// ============================================================================
// SAMPLE DATA
// ============================================================================
// This is example data to demonstrate how records would look in the system.
// Think of these as filled-out forms - real data that follows our blueprints.
// ============================================================================

// Sample users - three team members
const sampleUsers = [
  { id: 1, name: 'John Smith', email: 'john@example.com', role: 'Manager' },
  { id: 2, name: 'Sarah Johnson', email: 'sarah@example.com', role: 'Member' },
  { id: 3, name: 'Mike Chen', email: 'mike@example.com', role: 'Member' }
];

// Sample projects - two active projects
const sampleProjects = [
  { id: 1, name: 'Website Redesign', status: 'Active', owner_id: 1 },
  { id: 2, name: 'Mobile App Development', status: 'Planning', owner_id: 2 }
];

// Sample tasks - three tasks across the projects
const sampleTasks = [
  { id: 1, title: 'Design homepage mockup', status: 'In Progress', priority: 'High', project_id: 1, assignee_id: 1, due_date: '2026-06-05' },
  { id: 2, title: 'Review API documentation', status: 'Todo', priority: 'Medium', project_id: 2, assignee_id: 2, due_date: '2026-06-07' },
  { id: 3, title: 'Fix login bug', status: 'Done', priority: 'Critical', project_id: 1, assignee_id: 3, due_date: '2026-06-03' }
];

// ============================================================================
// EXPORTS
// ============================================================================
// This makes our code available to other files that want to use it.
// Think of this as putting items on a shelf so others can find and use them.
// ============================================================================

// Export the entity definitions and sample data
// Other files can import these to use them
module.exports = {
  // All the entity blueprints
  entities: {
    User: UserEntity,
    Project: ProjectEntity,
    Task: TaskEntity,
    Comment: CommentEntity,
    Milestone: MilestoneEntity
  },
  // Sample data for testing/demonstration
  sampleData: {
    users: sampleUsers,
    projects: sampleProjects,
    tasks: sampleTasks
  }
};
