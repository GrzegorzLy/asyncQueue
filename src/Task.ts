import {PromiseFunc, TaskOptions, Void, Reject, OperationTypes} from './types';
import LogBuilder from './Logger';

class Task {
  done: Void;
  reject: Reject;
  pf: PromiseFunc;
  options?: TaskOptions;
  logger?: LogBuilder;

  constructor(
    pf: PromiseFunc,
    done: Void,
    reject: Reject,
    logger?: LogBuilder,
    options?: TaskOptions
  ) {
    if (typeof pf !== 'function') {
      this.pf = () => pf;
    } else {
      this.pf = pf;
    }
    this.done = done;
    this.reject = reject;
    this.logger = logger;
    this.options = options;
  }

  private async runWithTimeout(timeout: number) {
    return Promise.race([
      new Promise((_, rej) =>
        setTimeout(
          () =>
            rej(new Error(`The operation has timed-out after ${timeout}ms`)),
          timeout
        )
      ),
      this.pf(),
    ]);
  }

  private async run() {
    return this.pf();
  }

  async tryRun(retryingCount = 0) {
    const timeout = this.options?.timeout || 0;
    const maxRetry = this.options?.maxRetry || 0;
    try {
      const result =
        timeout > 0 ? await this.runWithTimeout(timeout) : await this.run();
      this.done(result);
    } catch (err) {
      this.logger?.error(err, this.options?.name);
      if (retryingCount >= maxRetry) {
        this.logger?.log(OperationTypes.TaskReject, this.options?.name);
        this.reject(err);
      } else {
        this.logger?.log(OperationTypes.TaskRetry, this.options?.name);
        await this.tryRun(retryingCount + 1);
      }
    }
  }
}

export default Task;
