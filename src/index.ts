import asyncQueue from './AsyncQueue';
import {HookType} from './types';

const queue = asyncQueue({
  maxRetry: 1,
  concurrency: 2,
  timeout: 2,
  logger: console.log,
});

const random = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min)) + min;

function addPromise(num = 10) {
  for (let index = 1; index <= num; index++) {
    queue
      .push(
        () =>
          new Promise((res, rej) =>
            setTimeout(
              () => (Math.random() > 2 ? res(index) : rej(new Error('error'))),
              random(100, 1000)
            )
          ),
        {
          name: `${index}`,
        }
      )
      .then(console.log)
      .catch(() => console.log('---error---'));
  }
}
queue.addHook(HookType.beforeRun, (task, options) => {
  if (options?.name === 'test' && typeof task === 'number') {
    return task + 10;
  }
  return task;
});

queue.addHook(HookType.afterRunError, (task, options) => {
  return options;
});

addPromise(3);

// queue.push(1, {name: 'test'}).then(console.log);
// setTimeout(() => addPromise(2), 1000);

// setTimeout(() => queue.pause(), 400);
// setTimeout(() => queue.resume(), 6000);
