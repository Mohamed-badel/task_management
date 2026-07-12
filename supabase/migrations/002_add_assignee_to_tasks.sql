-- Add assignee column to tasks table
-- assignee stores the email of the assigned employee (nullable for unassigned tasks)

ALTER TABLE tasks
ADD COLUMN IF NOT EXISTS assignee text DEFAULT NULL;

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_tasks_assignee ON tasks(assignee);
