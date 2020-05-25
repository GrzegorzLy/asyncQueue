import {Options, OperationTypes} from './types';
import LogBuilder from './Logger';
import Task from './Task';

class TaskRunner {
  logger?: LogBuilder;
  options: Options;

  constructor(options: Options, logger?: LogBuilder) {
    this.logger = logger;
    this.options = options;
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
      task.pf(),
    ]);
  }

  private async run(task: Task) {
    return task.pf();
  }

  async tryRun(task: Task, retryingCount = 0) {
    const timeout = task.options?.timeout ?? this.options.timeout ?? 0;
    const maxRetry = task.options?.maxRetry ?? this.options.maxRetry ?? 0;
    try {
      const result =
        timeout > 0
          ? await this.runWithTimeout(task, timeout)
          : await this.run(task);

      task.done(result);
    } catch (err) {
      this.logger?.error(err, task.options?.name);
      if (retryingCount >= maxRetry) {
        this.logger?.log(OperationTypes.TaskReject, task.options?.name);
        task.reject(err);
      } else {
        this.logger?.log(OperationTypes.TaskRetry, task.options?.name);
        await this.tryRun(task, retryingCount + 1);
      }
    }
  }
}

export default TaskRunner;
