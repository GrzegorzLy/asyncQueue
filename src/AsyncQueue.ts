import {Queue, Options, PromiseFunc, TaskOptions, Void} from './types';
import PFQueue from './Queue';
import Task from './Task';

class AsyncQueue {
  private _queue: Queue;
  private _logger?: Void;
  private MAX_RETRY = 0;
  private CONCURRENCY = 1;
  private TASKS_RUNNING = 0;
  private IS_RUNNING = false;

  constructor(options?: Options) {
    this._queue = new PFQueue();
    this.TASKS_RUNNING = 0;
    this._logger = options?.logger;

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

  private canRun() {
    return (
      this.IS_RUNNING &&
      this.CONCURRENCY > this.TASKS_RUNNING &&
      this._queue.canNext()
    );
  }

  private async runTask() {
    this.TASKS_RUNNING++;
    const task = this._queue.dequeue();
    await task.tryRun(this.MAX_RETRY);
    this.TASKS_RUNNING--;

    if (this.canRun()) {
      this.runner();
    }
  }

  private runner() {
    while (this.canRun()) {
      this.runTask();
    }
  }

  private log(msg: string, type: string, options?: TaskOptions) {
    if (!this._logger) {
      return;
    }

    let logMsg = `[${type}]`;
    if (options?.name) {
      logMsg += ` name: ${options?.name} `;
    }

    this._logger(`${logMsg} time: ${new Date().toISOString()} | ${msg}`);
  }

  push(fn: PromiseFunc, options?: TaskOptions) {
    this.log('add function to queue', 'PUSH', options);
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
    this.log('queue starting', 'START');
    this.IS_RUNNING = true;
    this.runner();

    return new Promise(done => {
      if (!this._queue.canNext()) {
        done();
      }
    });
  }

  pause() {
    this.log('queue pause', 'PAUSE');
    this.IS_RUNNING = false;
    return Promise.resolve();
  }
}

export default AsyncQueue;
