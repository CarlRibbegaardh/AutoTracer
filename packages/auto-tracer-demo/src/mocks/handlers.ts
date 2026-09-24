import { http, HttpResponse, delay } from "msw";
import { taskDb } from "./taskDatabase";
import type { CreateTaskData, UpdateTaskData } from "../domain";

/**
 * Simulate network latency
 */
const DELAY_MS = 300;

/**
 * MSW request handlers for task API
 */
export const taskHandlers = [
  /**
   * GET /api/tasks - Get all tasks
   */
  http.get("/api/tasks", async () => {
    await delay(DELAY_MS);
    const tasks = taskDb.getAllTasks();
    return HttpResponse.json(tasks);
  }),

  /**
   * GET /api/tasks/:id - Get task by ID
   */
  http.get("/api/tasks/:id", async ({ params }) => {
    await delay(DELAY_MS);
    const { id } = params;
    const task = taskDb.getTask(id as string);

    if (!task) {
      return HttpResponse.json(
        { error: "Task not found" },
        { status: 404 }
      );
    }

    return HttpResponse.json(task);
  }),

  /**
   * POST /api/tasks - Create new task
   */
  http.post("/api/tasks", async ({ request }) => {
    await delay(DELAY_MS);
    const data = (await request.json()) as CreateTaskData;
    const task = taskDb.createTask(data);
    return HttpResponse.json(task, { status: 201 });
  }),

  /**
   * PATCH /api/tasks/:id - Update task
   */
  http.patch("/api/tasks/:id", async ({ params, request }) => {
    await delay(DELAY_MS);
    const { id } = params;
    const data = (await request.json()) as UpdateTaskData;
    const task = taskDb.updateTask(id as string, data);

    if (!task) {
      return HttpResponse.json(
        { error: "Task not found" },
        { status: 404 }
      );
    }

    return HttpResponse.json(task);
  }),

  /**
   * DELETE /api/tasks/:id - Delete task
   */
  http.delete("/api/tasks/:id", async ({ params }) => {
    await delay(DELAY_MS);
    const { id } = params;
    const deleted = taskDb.deleteTask(id as string);

    if (!deleted) {
      return HttpResponse.json(
        { error: "Task not found" },
        { status: 404 }
      );
    }

    return HttpResponse.json(null, { status: 204 });
  }),
];
