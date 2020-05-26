import Task from '../Task';
import TaskRunner from '../TaskRunner';
import Hooks from '../Hooks';

const taskRunner = new TaskRunner({}, new Hooks());

describe('TaskRunner', () => {
  test('the done function is called correctly when the pf is resolved', async () => {
    const done = jest.fn();
    const reject = jest.fn();
    const pf = jest.fn(
      () => new Promise(res => setTimeout(() => res('ok'), 4))
    );
    const task = new Task(pf, done, reject, {timeout: 6});
    await taskRunner.tryRun(task);

    expect(done).toBeCalledTimes(1);
    expect(done).toBeCalledWith('ok');
    expect(reject).toBeCalledTimes(0);
  });

  test('the reject function is called correctly when the pf is rejected', async () => {
    const done = jest.fn();
    const reject = jest.fn();
    const pf = () => Promise.reject('error');
    const task = new Task(pf, done, reject);
    await taskRunner.tryRun(task);

    expect(done).toBeCalledTimes(0);
    expect(reject).toBeCalledWith('error');
    expect(reject).toBeCalledTimes(1);
  });

  test('the task has been repeated two times', async () => {
    const done = jest.fn();
    const reject = jest.fn();
    const pf = jest.fn(() => Promise.reject('error'));
    const task = new Task(pf, done, reject, {maxRetry: 1});
    await taskRunner.tryRun(task);

    expect(pf).toBeCalledTimes(2);
    expect(reject).toBeCalledTimes(1);
    expect(reject).toBeCalledWith('error');
    expect(done).toBeCalledTimes(0);
  });

  test('the reject function is called when the timeout occurs', async () => {
    const done = jest.fn();
    const reject = jest.fn();
    const pf = jest.fn(() => new Promise(res => setTimeout(res, 4)));
    const task = new Task(pf, done, reject, {timeout: 2});
    await taskRunner.tryRun(task);

    expect(pf).toBeCalledTimes(1);
    expect(reject).toBeCalledTimes(1);
    expect(done).toBeCalledTimes(0);
  });
});
