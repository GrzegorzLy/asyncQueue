import asyncQueue from '../src/AsyncQueue';
import {HookType} from '../src/types';

const queue = asyncQueue({
  maxRetry: 1,
  concurrency: 2,
  timeout: 200,
  logger: console.log,
});

queue.addHook(HookType.beforeRun, async (task, options) => {
  if (options?.name === 'task1' && typeof task === 'function') {
    return (await task()) + 10;
  }
  return task;
});

queue.addHook(HookType.afterRun, async (task, options) => {
  if (options?.name === 'task2' && typeof task === 'number') {
    return task - 2;
  }
  return task;
});

queue.addHook(HookType.afterRunError, async () => {
  return ':(';
});

queue.push(() => Promise.resolve(1), {name: 'task1'}).then(console.log);
queue.push(() => Promise.resolve(2), {name: 'task2'}).then(console.log);
queue.pause();
queue.resume();
queue.push(() => Promise.reject(3), {name: 'task3'}).then(console.log);
