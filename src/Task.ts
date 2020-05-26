import {TaskOptions, Void, Reject} from './types';

class Task {
  done: Void;
  reject: Reject;
  task!: unknown;
  options?: TaskOptions;

  constructor(
    task: unknown,
    done: Void,
    reject: Reject,
    options?: TaskOptions
  ) {
    this.done = done;
    this.reject = reject;
    this.options = options;
    this.setTask(task);
  }

  run() {
    if (typeof this.task === 'function') {
      return this.task();
    } else {
      return this.task;
    }
  }

  setTask(task: unknown) {
    if (task === undefined || task === null) {
      throw new Error('task is undefined or null');
    }

    this.task = task;
    return this;
  }
}

export default Task;
