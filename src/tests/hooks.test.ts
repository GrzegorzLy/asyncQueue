import Hooks from '../Hooks';
import {HookType} from '../types';

const hooks = new Hooks();

describe('Hooks', () => {
  test('hook return correct value', () => {
    hooks.add(HookType.afterRun, task => task);
    hooks.add(HookType.afterRun, (task: number) => task + 1);
    const result = hooks.run(HookType.afterRun, 1);

    expect(result).toBe(2);
  });

  test('hook return correct value', () => {
    hooks.add(HookType.afterRun, () => null);
    const result = hooks.run(HookType.afterRun, 1);

    expect(result).toBe(null);
  });

  test('hook return initial value when error occurred', () => {
    hooks.add(HookType.afterRun, () => {
      throw new Error();
    });
    const result = hooks.run(HookType.afterRun, 1);

    expect(result).toBe(1);
  });

  test('hook return initial value when hook is not define', () => {
    hooks.add(HookType.beforeRun, () => {
      throw new Error();
    });
    const result = hooks.run(HookType.afterRun, 1);

    expect(result).toBe(1);
  });
});
