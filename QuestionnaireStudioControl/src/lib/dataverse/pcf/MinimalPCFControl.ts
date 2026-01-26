/**
 * Minimal PCF Control Example
 * 
 * A stripped-down example showing the essential patterns
 * for using Dataverse wrapper services in a PCF control.
 */

import type { IPCFContext } from './types';
import { createLogger } from './Logger';
import { createErrorHandler } from './ErrorHandler';
import { createCrudService, CrudService } from './CrudService';
import { createQueryService, QueryService } from './QueryService';

// ============================================================================
// Entity Interface
// ============================================================================

interface Task {
  [key: string]: unknown;
  activityid?: string;
  subject: string;
  description?: string;
  scheduledend?: string;
  statecode?: number;
  statuscode?: number;
  _regardingobjectid_value?: string;
}

// ============================================================================
// Minimal Control
// ============================================================================

export class MinimalTaskControl {
  // Services
  private _taskService!: CrudService<Task>;
  private _queryService!: QueryService;
  
  // PCF
  private _container!: HTMLDivElement;

  /**
   * INIT: Set up services once
   */
  init(
    context: IPCFContext,
    _notify: () => void,
    _state: unknown,
    container: HTMLDivElement
  ): void {
    this._container = container;

    // Create logger and error handler
    const logger = createLogger('TaskControl');
    const errorHandler = createErrorHandler(logger);

    // Initialize services (note: no direct context.webAPI usage!)
    this._taskService = createCrudService<Task>(context, 'task', {
      logger: logger.child('TaskService'),
      errorHandler,
    });
    this._queryService = createQueryService(context, {
      logger: logger.child('QueryService'),
      errorHandler,
    });

    // Load initial data
    this.loadTasks();
  }

  /**
   * UPDATE VIEW: Refresh context
   */
  updateView(context: IPCFContext): void {
    this._taskService.updateContext(context);
    this._queryService.updateContext(context);
  }

  /**
   * DESTROY: Cleanup
   */
  destroy(): void {
    this._container.innerHTML = '';
  }

  /**
   * Load tasks using QueryService
   */
  private async loadTasks(): Promise<void> {
    this._container.innerHTML = '<div>Loading...</div>';

    // Use QueryService for retrieval (NOT context.webAPI)
    const result = await this._queryService.retrieveMultiple<Task>('task', {
      select: ['subject', 'scheduledend', 'statecode'],
      filter: 'statecode eq 0', // Open tasks
      orderBy: 'scheduledend asc',
      top: 20,
    });

    if (result.success) {
      this.renderTasks(result.data.entities);
    } else {
      // Error handling via ErrorHandler (userMessage is already friendly)
      this._container.innerHTML = `<div class="error">${result.error.userMessage}</div>`;
    }
  }

  /**
   * Create task using CrudService
   */
  async createTask(subject: string, dueDate: Date): Promise<string | null> {
    // Use CrudService for creation (NOT context.webAPI)
    const result = await this._taskService.create({
      subject,
      scheduledend: dueDate.toISOString(),
    });

    if (result.success) {
      await this.loadTasks(); // Refresh list
      return result.data.id;
    }

    alert(result.error.userMessage);
    return null;
  }

  /**
   * Complete task using CrudService
   */
  async completeTask(taskId: string): Promise<boolean> {
    // Use CrudService for update (NOT context.webAPI)
    const result = await this._taskService.update(taskId, {
      statecode: 1, // Completed
      statuscode: 5, // Completed
    });

    if (result.success) {
      await this.loadTasks();
      return true;
    }

    alert(result.error.userMessage);
    return false;
  }

  /**
   * Delete task using CrudService
   */
  async deleteTask(taskId: string): Promise<boolean> {
    // Use CrudService for deletion (NOT context.webAPI)
    const result = await this._taskService.delete(taskId);

    if (result.success) {
      await this.loadTasks();
      return true;
    }

    alert(result.error.userMessage);
    return false;
  }

  /**
   * Render task list
   */
  private renderTasks(tasks: Task[]): void {
    if (tasks.length === 0) {
      this._container.innerHTML = '<div>No open tasks</div>';
      return;
    }

    this._container.innerHTML = `
      <ul class="task-list">
        ${tasks.map(task => `
          <li data-id="${task.activityid}">
            <span>${task.subject}</span>
            ${task.scheduledend 
              ? `<small>Due: ${new Date(task.scheduledend).toLocaleDateString()}</small>` 
              : ''}
            <button class="complete-btn">✓</button>
          </li>
        `).join('')}
      </ul>
    `;

    // Add event listeners
    this._container.querySelectorAll('.complete-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const li = (e.target as HTMLElement).closest('li');
        const id = li?.dataset.id;
        if (id) this.completeTask(id);
      });
    });
  }
}
