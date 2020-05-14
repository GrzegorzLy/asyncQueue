import {
  Queue,
  Options,
  PromiseFunc,
  TaskOptions,
  Void,
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
  private IS_RUNNING = false;

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

    if (this.canRun()) {
      this.runner();
    }
  }

  push(fn: PromiseFunc, options?: TaskOptions) {
    this._logger.log(OperationTypes.Push);
    return new Promise((done, reject) => {
      this._queue.push(new Task(fn, done, reject, options));
      if (this.IS_RUNNING) {
        this.runner();
      }
    });
  }

  async start() {
    if (this.IS_RUNNING) {
      return Promise.resolve();
    }
    this._logger.log(OperationTypes.Start);

    this.IS_RUNNING = true;
    this.runner();

    return new Promise(done => {
      if (!this._queue.canNext()) {
        done();
      }
    });
  }

  pause() {
    this._logger.log(OperationTypes.Pause);
    this.IS_RUNNING = false;
    return Promise.resolve();
  }
}

export default AsyncQueue;
