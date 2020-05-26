import {Options, OperationTypes, HookType} from './types';
import LogBuilder from './Logger';
import Task from './Task';
import Hooks from './Hooks';

class TaskRunner {
  logger?: LogBuilder;
  options: Options;
  hooks: Hooks;

  constructor(options: Options, hooks: Hooks, logger?: LogBuilder) {
    this.logger = logger;
    this.options = options;
    this.hooks = hooks;
  }

  private async runWithTimeout(task: Task, timeout: number) {
    return Promise.race([
      new Promise((_, rej) =>
        setTimeout(
          () =>
            rej(new Error(`The operation has timed-out after ${timeout}ms`)),
          timeout
        )
      ),
      task.run(),
    ]);
  }

  private run(task: Task) {
    return task.run();
  }

  async tryRun(task: Task, retryingCount = 0) {
    const timeout = task.options?.timeout ?? this.options.timeout ?? 0;
    const maxRetry = task.options?.maxRetry ?? this.options.maxRetry ?? 0;
    try {
      const result =
        timeout > 0
          ? await this.runWithTimeout(task, timeout)
          : await this.run(task);
      task.done(this.hooks.run(HookType.afterRun, result, task.options));
    } catch (err) {
      this.logger?.error(err, task.options?.name);
      if (retryingCount >= maxRetry) {
        this.logger?.log(OperationTypes.TaskReject, task.options?.name);
        task.reject(err);
      } else {
        this.logger?.log(OperationTypes.TaskRetry, task.options?.name);
        task.setTask(
          this.hooks.run(HookType.afterRunError, task.task, task.options)
        );

        await this.tryRun(task, retryingCount + 1);
      }
    }
  }
}

export default TaskRunner;
