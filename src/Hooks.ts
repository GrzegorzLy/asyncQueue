import {HookType, TaskOptions, ActiveHooks, MiddlewareFunc} from './types';

class Hooks {
  private activeHooks: ActiveHooks;

  constructor() {
    this.activeHooks = {};
  }

  run(type: HookType, value: unknown, options?: TaskOptions) {
    if (!this.activeHooks[type]) {
      return value;
    }

    try {
      return this.activeHooks[type]?.reduce(
        (result, hook) => hook(result, options),
        value
      );
    } catch (err) {
      return value;
    }
  }

  add(type: HookType, hook: MiddlewareFunc) {
    if (!this.activeHooks[type]) {
      this.activeHooks[type] = [];
    }
    this.activeHooks[type]?.push(hook);
  }
}

export default Hooks;
