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
});
