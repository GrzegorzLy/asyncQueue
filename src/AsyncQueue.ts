import {
  Queue,
  Options,
  PromiseFunc,
  TaskOptions,
  OperationTypes,
} from './types';
import PFQueue from './Queue';
import Task from './Task';
import LogBuilder from './Logger';

class AsyncQueue {
  private _queue: Queue;
  private _logger: LogBuilder;
  private MAX_RETRY = 0;
  private CONCURRENCY = 1;
  private ACTIVE_COUNT = 0;
  private IS_RUNNING = true;

  constructor(options?: Options) {
    this._queue = new PFQueue();
    this.ACTIVE_COUNT = 0;
    this._logger = new LogBuilder(options?.logger);

    this.setOptions(options);
  }

  private setOptions(options?: Options) {
    if (options?.concurrency && options.concurrency > 1) {
      this.CONCURRENCY = options.concurrency;
    }
    if (options?.maxRetry && options.maxRetry > 0) {
      this.MAX_RETRY = options.maxRetry;
    }
  }

  private runner() {
    while (this.canRun()) {
      this._logger.log(OperationTypes.RunTusk);
      this.ACTIVE_COUNT++;
      this.runTask();
    }
  }

  private canRun() {
    return (
      this.IS_RUNNING &&
      this.ACTIVE_COUNT < this.CONCURRENCY &&
      this._queue.canNext()
    );
  }

  private async runTask() {
    const task = this._queue.dequeue();
    await task.tryRun(this.MAX_RETRY);
    this.ACTIVE_COUNT--;
    this._logger.log(OperationTypes.EndTask);

    this.runner();
  }

  push(task: PromiseFunc, options?: TaskOptions) {
    this._logger.log(OperationTypes.Push);

    if (task === undefined) {
      return Promise.reject(new Error('task is undefined or null'));
    }

    return new Promise((done, reject) => {
      this._queue.push(new Task(task, done, reject, options));
      this.runner();
    });
  }

  async resume() {
    if (this.IS_RUNNING) return Promise.resolve();

    this._logger.log(OperationTypes.Resume);
    this.IS_RUNNING = true;
    this.runner();

    return Promise.resolve();
  }

  pause() {
    this._logger.log(OperationTypes.Pause);
    this.IS_RUNNING = false;

    return Promise.resolve();
  }
}

export default AsyncQueue;
