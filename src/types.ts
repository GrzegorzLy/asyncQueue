import Task from './Task';

export interface Queue {
  push: (ps: Task) => void;
  dequeue: () => Task;
  canNext: () => boolean;
}

export type PromiseFunc = () => Promise<unknown>;

export interface Options {
  maxRetry?: number;
  concurrency?: number;
}

export interface TaskOptions extends Options {
  name?: string;
}
