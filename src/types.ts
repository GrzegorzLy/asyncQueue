export type Void = (value: unknown) => void;
export type Reject = (error: Error) => void;
export type Logger = (msg: string) => void;
export type ActiveHooks = {[value in HookType]?: Array<MiddlewareFunc>};
export type MiddlewareFunc = (task: unknown, options?: TaskOptions) => unknown;

export type RunHook = (
  type: HookType,
  value: unknown,
  options?: TaskOptions
) => unknown;
export interface Options {
  maxRetry?: number;
  concurrency?: number;
  timeout?: number;
  logger?: Void;
}

export interface TaskOptions {
  name?: string;
  maxRetry?: number;
  timeout?: number;
}

export enum OperationTypes {
  QueuePush,
  QueueResume,
  QueuePause,
  QueueEmpty,
  TaskRun,
  TaskDone,
  TaskError,
  TaskReject,
  TaskRetry,
}

export enum HookType {
  beforeRun = 'beforeRun',
  afterRun = 'afterRun',
  afterRunError = 'afterRunError',
}
