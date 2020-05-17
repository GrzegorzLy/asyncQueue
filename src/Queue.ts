import Task from './Task';

class Queue {
  private _queue: Array<Task>;

  constructor() {
    this._queue = [];
  }

  push(pf: Task) {
    this._queue.push(pf);
  }

  dequeue() {
    const task = this._queue.shift();
    if (!task) {
      throw new Error('empty queue');
    }

    return task;
  }

  canNext() {
    return this._queue.length > 0;
  }
}

export default Queue;
