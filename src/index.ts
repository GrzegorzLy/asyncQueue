import Queue from './AsyncQueue';

const queue = new Queue({maxRetry: 2, concurrency: 3, logger: console.log});

const random = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min)) + min;

function addPromise(num = 10) {
  for (let index = 1; index <= num; index++) {
    queue
      .push(
        () =>
          new Promise(res => setTimeout(() => res(index), random(100, 1000))),
        {
          name: `${index}`,
        }
      )
      .then(console.log)
      .catch(console.log);
  }
}

setTimeout(() => addPromise(2), 1000);
addPromise(20);

queue.start().then(c => console.log('ok'));
setTimeout(() => queue.pause(), 400);
setTimeout(() => queue.start(), 6000);
