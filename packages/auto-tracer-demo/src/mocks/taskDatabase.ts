import type { Task, CreateTaskData, UpdateTaskData } from "../domain";

/**
 * In-memory task database
 */
class TaskDatabase {
  private tasks: Map<string, Task> = new Map();
  private nextId = 1;

  constructor() {
    this.seedInitialData();
  }

  /**
   * Seed initial demo data
   */
  private seedInitialData(): void {
    const now = new Date().toISOString();
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    const initialTasks: Task[] = [
      {
        id: this.generateId(),
        title: "Setup ReactTracer Demo",
        description: "Create a comprehensive demo showcasing ReactTracer capabilities",
        status: "completed",
        priority: "high",
        dueDate: yesterday,
        createdAt: now,
        updatedAt: now,
        tags: ["development", "demo"],
      },
      {
        id: this.generateId(),
        title: "Review MUI Components",
        description: "Explore Material-UI component library for the dashboard",
        status: "in-progress",
        priority: "medium",
        dueDate: tomorrow,
        createdAt: now,
        updatedAt: now,
        tags: ["research", "ui"],
      },
      {
        id: this.generateId(),
        title: "Implement Task Filters",
        description: "Add filtering by status, priority, and tags",
        status: "pending",
        priority: "high",
        dueDate: tomorrow,
        createdAt: now,
        updatedAt: now,
        tags: ["feature", "development"],
      },
      {
        id: this.generateId(),
        title: "Write Documentation",
        description: "Document the demo application and ReactTracer integration",
        status: "pending",
        priority: "medium",
        dueDate: null,
        createdAt: now,
        updatedAt: now,
        tags: ["documentation"],
      },
      {
        id: this.generateId(),
        title: "Add E2E Tests",
        description: "Create Playwright tests for critical user flows",
        status: "pending",
        priority: "low",
        dueDate: null,
        createdAt: now,
        updatedAt: now,
        tags: ["testing", "qa"],
      },
    ];

    initialTasks.forEach((task) => this.tasks.set(task.id, task));
  }

  /**
   * Generate unique task ID
   */
  private generateId(): string {
    return `task-${this.nextId++}`;
  }

  /**
   * Get all tasks
   */
  getAllTasks(): Task[] {
    return Array.from(this.tasks.values());
  }

  /**
   * Get task by ID
   */
  getTask(id: string): Task | undefined {
    return this.tasks.get(id);
  }

  /**
   * Create new task
   */
  createTask(data: CreateTaskData): Task {
    const now = new Date().toISOString();
    const task: Task = {
      id: this.generateId(),
      ...data,
      status: data.status ?? "pending",
      createdAt: now,
      updatedAt: now,
    };
    this.tasks.set(task.id, task);
    return task;
  }

  /**
   * Update existing task
   */
  updateTask(id: string, data: UpdateTaskData): Task | undefined {
    const existing = this.tasks.get(id);
    if (!existing) return undefined;

    const updated: Task = {
      ...existing,
      ...data,
      updatedAt: new Date().toISOString(),
    };
    this.tasks.set(id, updated);
    return updated;
  }

  /**
   * Delete task
   */
  deleteTask(id: string): boolean {
    return this.tasks.delete(id);
  }
}

export const taskDb = new TaskDatabase();
