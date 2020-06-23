import {
  HookType,
  TaskOptions,
  ActiveHooks,
  MiddlewareFunc,
  OperationTypes,
} from './types';
import LogBuilder from './Logger';

class Hooks {
  private activeHooks: ActiveHooks;
  private logger?: LogBuilder;

  constructor(logger?: LogBuilder) {
    this.activeHooks = {};
    this.logger = logger;
  }

  async run(type: HookType, value: unknown, options?: TaskOptions) {
    if (!this.activeHooks[type]) {
      return value;
    }

    try {
      this.logger?.log(OperationTypes.HooksStart, options?.name);
      let result = value;
      const hooks = this.activeHooks[type] || [];

      for (const hook of hooks) {
        result = await hook(result, options || {});
      }

      this.logger?.log(OperationTypes.HooksDone, options?.name);
      return result;
    } catch (err) {
      this.logger?.error(err, options?.name);
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
