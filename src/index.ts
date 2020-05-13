import Queue from './AsyncQueue';

const queue = new Queue({maxRetry: 2, concurrency: 3});

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

addPromise(20);

// setTimeout(() => queue.pause(), 400);

queue.start().then(c => console.log('ok'));
queue.start().then(c => console.log('ok'));
