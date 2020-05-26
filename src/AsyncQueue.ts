import {
  Options,
  TaskOptions,
  OperationTypes,
  HookType,
  MiddlewareFunc,
} from './types';
import Queue from './Queue';
import Task from './Task';
import LogBuilder from './Logger';
import TaskRunner from './TaskRunner';
import Hooks from './Hooks';

//TODO:
//-event emitter(onPush, onRun, OnSuccess, OnError, onPause, onResume, onEmpty)

function asyncQueue(options?: Options) {
  const _queue = new Queue();
  const _logger = options?.logger && new LogBuilder(options.logger);
  const _hooks = new Hooks();
  const _taskRunner = new TaskRunner(options ?? {}, _hooks, _logger);

  let ACTIVE_COUNT = 0;
  let CONCURRENCY = 1;
  let IS_RUNNING = true;

  if (options?.concurrency && options.concurrency > 1) {
    CONCURRENCY = options.concurrency;
  }

  function _next() {
    if (!IS_RUNNING || ACTIVE_COUNT >= CONCURRENCY) return;

    if (!_queue.canNext()) {
      if (!ACTIVE_COUNT) {
        _logger?.log(OperationTypes.QueueEmpty);
      }
      return;
    }
    ACTIVE_COUNT++;
    _runTask();
  }

  async function _runTask() {
    const task = _queue.dequeue();
    task.setTask(_hooks.run(HookType.beforeRun, task.task, task.options));

    _logger?.log(OperationTypes.TaskRun, task.options?.name);
    await _taskRunner.tryRun(task);
    ACTIVE_COUNT--;
    _logger?.log(OperationTypes.TaskDone, task.options?.name);

    _next();
  }

  function push(taskQueue: unknown | Array<unknown>, options?: TaskOptions) {
    _logger?.log(OperationTypes.QueuePush, options?.name);
    const pushTask = (task: unknown) =>
      new Promise((done, reject) => {
        _queue.push(new Task(task, done, reject, options));
      });

    try {
      const task = Array.isArray(taskQueue)
        ? Promise.resolve(taskQueue.map(pushTask))
        : pushTask(taskQueue);

      _next();
      return task;
    } catch (err) {
      return Promise.reject(err);
    }
  }

  function resume() {
    if (IS_RUNNING) return Promise.resolve();

    _logger?.log(OperationTypes.QueueResume);
    IS_RUNNING = true;
    _next();

    return Promise.resolve();
  }

  function pause() {
    IS_RUNNING = false;
    _logger?.log(OperationTypes.QueuePause);

    return Promise.resolve();
  }

  function addHook(type: HookType, hook: MiddlewareFunc) {
    _hooks.add(type, hook);
  }

  return {push, resume, pause, addHook};
}

export default asyncQueue;
