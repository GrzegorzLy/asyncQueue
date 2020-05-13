import {Queue, Options, PromiseFunc, TaskOptions} from './types';
import PFQueue from './Queue';
import Task from './Task';

class AsyncQueue {
  private _queue: Queue;
  private MAX_RETRY = 0;
  private CONCURRENCY = 1;
  private TASKS_RUNNING = 0;

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

  private async run() {
    const task = this._queue.dequeue();
    this.TASKS_RUNNING++;
    await task.tryRun(this.MAX_RETRY);
    console.log('TASKS_RUNNING ', this.TASKS_RUNNING);
    this.TASKS_RUNNING--;

    if (this.canRun()) {
      this.run();
    }
  }

  push(fn: PromiseFunc, options?: TaskOptions) {
    const task = new Promise((done, reject) => {
      this._queue.push(new Task(fn, done, reject, options));
    });

    return task;
  }

  async start() {
    for (let index = 0; index < this.CONCURRENCY; index++) {
      if (this.canRun()) {
        this.run();
      }
    }

    return new Promise(done => {
      if (!this._queue.canNext()) {
        done();
      }
    });
  }
}

export default AsyncQueue;
