import Queue from './AsyncQueue';

const queue = new Queue({
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
      .then()
      .catch(() => console.log('---error---'));
  }
}

// setTimeout(() => addPromise(2), 1000);
addPromise(1);

// setTimeout(() => queue.pause(), 400);
// setTimeout(() => queue.resume(), 6000);
