import {Options, PromiseFunc, TaskOptions, OperationTypes} from './types';
import Queue from './Queue';
import Task from './Task';
import LogBuilder from './Logger';

class AsyncQueue {
  private _queue: Queue;
  private _logger?: LogBuilder;
  private _options?: Options;
  private _CONCURRENCY = 1;
  private _ACTIVE_COUNT = 0;
  private _IS_RUNNING = true;

  constructor(options?: Options) {
    this._queue = new Queue();
    this._ACTIVE_COUNT = 0;
    this._options = options;

    if (options?.concurrency && options.concurrency > 1) {
      this._CONCURRENCY = options.concurrency;
    }

    if (options?.logger) {
      this._logger = new LogBuilder(options.logger);
    }
  }

  private _next() {
    if (!this._IS_RUNNING || this._ACTIVE_COUNT >= this._CONCURRENCY) return;
    if (!this._queue.canNext()) {
      if (!this._ACTIVE_COUNT) {
        this._logger?.log(OperationTypes.QueueEmpty);
      }
      return;
    }
    this._ACTIVE_COUNT++;
    this._runTask();
  }

  private async _runTask() {
    const task = this._queue.dequeue();
    this._logger?.log(OperationTypes.TaskRun, task.options?.name);
    await task.tryRun();
    this._ACTIVE_COUNT--;
    this._logger?.log(OperationTypes.TaskDone, task.options?.name);

    this._next();
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
      this._next();
    });
  }

  resume() {
    if (this._IS_RUNNING) return Promise.resolve();

    this._logger?.log(OperationTypes.QueueResume);
    this._IS_RUNNING = true;
    this._next();

    return Promise.resolve();
  }

  pause() {
    this._IS_RUNNING = false;
    this._logger?.log(OperationTypes.QueuePause);

    return Promise.resolve();
  }
}

export default AsyncQueue;
