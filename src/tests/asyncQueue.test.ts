/* eslint-disable @typescript-eslint/no-explicit-any */
import Queue from '../AsyncQueue';

describe('async queue', () => {
  test('task returns the correct value', async () => {
    const queue = new Queue();
    const task = queue.push(() => Promise.resolve(1));

    await expect(task).resolves.toBe(1);
  });

  test('tasks returns the correct values in the correct order', async () => {
    const queue = new Queue();
    const tasks = [
      queue.push(() => Promise.resolve(1)),
      queue.push(() => Promise.resolve(2)),
    ];

    await expect(Promise.all(tasks)).resolves.toEqual([1, 2]);
  });

  test('tasks returns the array of promise in the correct  order', async () => {
    const queue = new Queue();
    const tasks = await queue.push([
      () => Promise.resolve(1),
      () => Promise.resolve(2),
    ]);

    if (Array.isArray(tasks)) {
      await expect(Promise.all(tasks)).resolves.toEqual([1, 2]);
    }
    expect(Array.isArray(tasks)).toBeTruthy();
  });

  test('task returns the correct values when function does not return promise', async () => {
    const queue = new Queue();
    const task = queue.push(() => 1 as any);

    await expect(task).resolves.toBe(1);
  });

  test('task returns the correct values when argument is not a function', async () => {
    const queue = new Queue();
    const task = queue.push(1 as any);

    await expect(task).resolves.toBe(1);
  });

  test('when the task is undefined it return promise reject', async () => {
    const queue = new Queue();
    const task = queue.push(undefined as any);

    await expect(task).rejects.toThrowError();
  });

  test('when the task is null it return promise reject', async () => {
    const queue = new Queue();
    const task = queue.push(undefined as any);

    await expect(task).rejects.toThrowError();
  });

  test('the task will be resolved before a timeout exception', async () => {
    const queue = new Queue({timeout: 4});
    const task = queue.push(
      () => new Promise(res => setTimeout(() => res(1), 3))
    );

    await expect(task).resolves.toBe(1);
  });

  test('the task before resolve will return a timeout promise reject', async () => {
    const queue = new Queue({timeout: 4});
    const task = queue.push(() => new Promise(res => setTimeout(res, 3)), {
      timeout: 2,
    });

    await expect(task).rejects.toThrowError();
  });

  test('the task before resolve will return a timeout promise reject', async () => {
    const queue = new Queue({timeout: 2});
    const task = queue.push(() => new Promise(res => setTimeout(res, 3)));

    await expect(task).rejects.toThrowError();
  });
});
