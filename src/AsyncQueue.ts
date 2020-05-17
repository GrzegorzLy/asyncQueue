import {Options, PromiseFunc, TaskOptions, OperationTypes} from './types';
import Queue from './Queue';
import Task from './Task';
import LogBuilder from './Logger';

class AsyncQueue {
  private _queue: Queue;
  private _logger?: LogBuilder;
  private MAX_RETRY = 0;
  private CONCURRENCY = 1;
  private ACTIVE_COUNT = 0;
  private IS_RUNNING = true;

  constructor(options?: Options) {
    this._queue = new Queue();
    this.ACTIVE_COUNT = 0;

    this.setOptions(options);
  }

  private setOptions(options?: Options) {
    if (options?.concurrency && options.concurrency > 1) {
      this.CONCURRENCY = options.concurrency;
    }
    if (options?.maxRetry && options.maxRetry > 0) {
      this.MAX_RETRY = options.maxRetry;
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
    await task.tryRun(this.MAX_RETRY);
    this.ACTIVE_COUNT--;
    this._logger?.log(OperationTypes.EndTask, task.options?.name);

    this.next();
  }

  push(task: PromiseFunc, options?: TaskOptions) {
    this._logger?.log(OperationTypes.Push, options?.name);

    if (task === undefined) {
      return Promise.reject(new Error('task is undefined or null'));
    }

    return new Promise((done, reject) => {
      this._queue.push(new Task(task, done, reject, options));
      this.next();
    });
  }

  async resume() {
    if (this.IS_RUNNING) return Promise.resolve();

    this._logger?.log(OperationTypes.Resume);
    this.IS_RUNNING = true;
    this.next();

    return Promise.resolve();
  }

  pause() {
    this.IS_RUNNING = false;
    this._logger?.log(OperationTypes.Pause);

    return Promise.resolve();
  }
}

export default AsyncQueue;
