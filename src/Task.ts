import {PromiseFunc, TaskOptions, Void, Reject} from './types';

class Task {
  done: Void;
  reject: Reject;
  pf!: PromiseFunc;
  options?: TaskOptions;

  constructor(
    pf: PromiseFunc,
    done: Void,
    reject: Reject,
    options?: TaskOptions
  ) {
    this.done = done;
    this.reject = reject;
    this.options = options;
    this.setPromiseFunction(pf);
  }

  setPromiseFunction(pf: PromiseFunc) {
    if (typeof pf !== 'function') {
      this.pf = () => pf;
    } else {
      this.pf = pf;
    }
  }
}

export default Task;
