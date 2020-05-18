import {Options, PromiseFunc, TaskOptions, OperationTypes} from './types';
import Queue from './Queue';
import Task from './Task';
import LogBuilder from './Logger';

class AsyncQueue {
  private _queue: Queue;
  private _logger?: LogBuilder;
  private _options?: Options;
  private CONCURRENCY = 1;
  private ACTIVE_COUNT = 0;
  private IS_RUNNING = true;

  constructor(options?: Options) {
    this._queue = new Queue();
    this.ACTIVE_COUNT = 0;
    this._options = options;

    this.setOptions(options);
  }

  private setOptions(options?: Options) {
    if (options?.concurrency && options.concurrency > 1) {
      this.CONCURRENCY = options.concurrency;
    }
    if (options?.logger) {
      this._logger = new LogBuilder(options?.logger);
    }
  }

  private next() {
    if (!this.IS_RUNNING || this.ACTIVE_COUNT >= this.CONCURRENCY) return;
    if (!this._queue.canNext()) {
      if (!this.ACTIVE_COUNT) {
        this._logger?.log(OperationTypes.QueueEmpty);
      }
      return;
    }
    this.ACTIVE_COUNT++;
    this.runTask();
  }

  private async runTask() {
    const task = this._queue.dequeue();
    this._logger?.log(OperationTypes.TaskRun, task.options?.name);
    await task.tryRun();
    this.ACTIVE_COUNT--;
    this._logger?.log(OperationTypes.TaskDone, task.options?.name);

    this.next();
  }

  push(task: PromiseFunc, options?: TaskOptions) {
    this._logger?.log(OperationTypes.QueuePush, options?.name);

    if (task === undefined) {
      return Promise.reject(new Error('task is undefined or null'));
    }

    return new Promise((done, reject) => {
      this._queue.push(
        new Task(task, done, reject, this._logger, {
          maxRetry: this._options?.maxRetry,
          timeout: this._options?.timeout,
          ...options,
        })
      );
      this.next();
    });
  }

  async resume() {
    if (this.IS_RUNNING) return Promise.resolve();

    this._logger?.log(OperationTypes.QueueResume);
    this.IS_RUNNING = true;
    this.next();

    return Promise.resolve();
  }

  pause() {
    this.IS_RUNNING = false;
    this._logger?.log(OperationTypes.QueuePause);

    return Promise.resolve();
  }
}

export default AsyncQueue;
