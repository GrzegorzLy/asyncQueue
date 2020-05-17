export type Void = (value: unknown) => void;
export type Reject = (error: Error) => void;
export type Logger = (msg: string) => void;
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
  Resume,
  Pause,
  Retry,
  RunTusk,
  EndTask,
  QueueEmpty,
}
