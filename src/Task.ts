import {PromiseFunc, TaskOptions, Void, Reject} from './types';

class Task {
  done: Void;
  reject: Reject;
  pf: PromiseFunc;
  options?: TaskOptions;

  constructor(
    pf: PromiseFunc,
    done: Void,
    reject: Reject,
    options?: TaskOptions
  ) {
    if (typeof pf !== 'function') {
      this.pf = () => pf;
    } else {
      this.pf = pf;
    }
    this.done = done;
    this.reject = reject;
    this.options = options;
  }

  async tryRun(maxRetry: number, retryingCount = 0) {
    try {
      const result = await this.pf();
      this.done(result);
    } catch (err) {
      if (retryingCount > (this.options?.maxRetry || maxRetry)) {
        this.reject(err);
      } else {
        this.tryRun(maxRetry, retryingCount + 1);
      }
    }
  }
}

export default Task;
