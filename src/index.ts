import Queue from './AsyncQueue';

const queue = new Queue({maxRetry: 2, concurrency: 7});

queue
  .push(() => new Promise(res => setTimeout(() => res(1), 300)), {name: '1'})
  .then(console.log)
  .catch(console.log);
queue
  .push(() => new Promise(res => setTimeout(() => res(2), 200)), {
    name: '2',
  })
  .then(console.log)
  .catch(console.log);
queue
  .push(() => new Promise(res => setTimeout(() => res(3), 400)), {name: '3'})
  .then(console.log)
  .catch(console.log);
queue
  .push(() => new Promise(res => setTimeout(() => res(4), 100)), {name: '4'})
  .then(console.log)
  .catch(console.log);
queue
  .push(() => new Promise(res => setTimeout(() => res(5), 200)), {
    name: '5',
  })
  .then(console.log)
  .catch(console.log);
queue
  .push(() => new Promise(res => setTimeout(() => res(6), 400)), {name: '6'})
  .then(console.log)
  .catch(console.log);
queue
  .push(() => new Promise(res => setTimeout(() => res(7), 200)), {name: '7'})
  .then(console.log)
  .catch(console.log);

queue.start().then(c => console.log('ok'));
