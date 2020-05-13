import {Queue, Options, PromiseFunc, TaskOptions} from './types';
import PFQueue from './Queue';
import Task from './Task';

class AsyncQueue {
  private _queue: Queue;
  private MAX_RETRY = 0;
  private CONCURRENCY = 1;
  private TASKS_RUNNING = 0;
  private RUNNER_WORKING = false;

  constructor(options?: Options) {
    this._queue = new PFQueue();
    this.TASKS_RUNNING = 0;

    this.setConcurrency(options?.concurrency);
    this.setMaxRetry(options?.maxRetry);
  }

  private setConcurrency(concurrency?: number) {
    if (concurrency !== undefined) {
      if (concurrency < 1) {
        throw new RangeError('concurrency must be greaten then 1');
      }
      this.CONCURRENCY = concurrency;
    }
  }

  private setMaxRetry(maxRetry?: number) {
    if (maxRetry !== undefined) {
      if (maxRetry < 0) {
        throw new RangeError('maxRetry must be greaten then 0');
      }
      this.MAX_RETRY = maxRetry;
    }
  }

  private canRun() {
    return this.CONCURRENCY > this.TASKS_RUNNING && this._queue.canNext();
  }

  private async runTask() {
    this.TASKS_RUNNING++;
    const task = this._queue.dequeue();
    await task.tryRun(this.MAX_RETRY);
    this.TASKS_RUNNING--;

    if (!this.RUNNER_WORKING && this.canRun()) {
      this.runner();
    }
  }

  private runner() {
    this.RUNNER_WORKING = true;
    while (this.canRun()) {
      this.runTask();
    }
    this.RUNNER_WORKING = false;
  }

  push(fn: PromiseFunc, options?: TaskOptions) {
    return new Promise((done, reject) => {
      this._queue.push(new Task(fn, done, reject, options));
    });
  }

  async start() {
    this.runner();

    return new Promise(done => {
      if (!this._queue.canNext()) {
        done();
      }
    });
  }
}

export default AsyncQueue;
