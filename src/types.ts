import Task from './Task';

export type Void = (value: unknown) => void;
export type Reject = (error: Error) => void;
export type Logger = (msg: string) => void;
export interface Queue {
  push: (ps: Task) => void;
  dequeue: () => Task;
  canNext: () => boolean;
}

export type PromiseFunc = () => Promise<unknown>;

export interface Options {
  maxRetry?: number;
  concurrency?: number;
  logger?: Void;
}

export interface TaskOptions {
  name?: string;
  maxRetry?: number;
}

export enum OperationTypes {
  Push,
  Enqueue,
  Start,
  Pause,
  Retry,
  RunTusk,
  EndTask,
}
