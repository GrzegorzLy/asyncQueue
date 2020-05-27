import Hooks from '../Hooks';
import {HookType} from '../types';

describe('Hooks', () => {
  test('hook return correct value', async () => {
    const hooks = new Hooks();
    hooks.add(HookType.afterRun, task => task);
    hooks.add(HookType.afterRun, (task: number) => task + 1);
    const result = await hooks.run(HookType.afterRun, 1);

    expect(result).toBe(2);
  });

  test('hook return correct value', async () => {
    const hooks = new Hooks();
    hooks.add(HookType.afterRun, () => null);
    const result = await hooks.run(HookType.afterRun, 1);

    expect(result).toBe(null);
  });

  test('hook return initial value when error occurred', async () => {
    const hooks = new Hooks();
    hooks.add(HookType.afterRun, () => {
      throw new Error();
    });
    const result = await hooks.run(HookType.afterRun, 1);

    expect(result).toBe(1);
  });

  test('hook return initial value when hook is not define', async () => {
    const hooks = new Hooks();
    hooks.add(HookType.beforeRun, () => {
      throw new Error();
    });
    const result = await hooks.run(HookType.afterRun, 1);

    expect(result).toBe(1);
  });

  test('hook return correct value', async () => {
    const hooks = new Hooks();
    hooks.add(HookType.beforeRun, task => task);
    hooks.add(HookType.beforeRun, (task: number) => Promise.resolve(task + 1));
    const result = await hooks.run(HookType.beforeRun, 1);

    expect(result).toBe(2);
  });
});
