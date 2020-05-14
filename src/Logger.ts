import {OperationTypes, Logger} from './types';

class LogBuilder {
  private logger?: Logger;

  constructor(logger?: Logger) {
    this.logger = logger;
  }

  private builder(type: OperationTypes) {
    switch (type) {
      case OperationTypes.RunTusk:
        return 'task is running';
      case OperationTypes.EndTask:
        return 'task end';
      case OperationTypes.Push:
        return 'task push to async queue';
      case OperationTypes.Start:
        return 'queue starting';
      case OperationTypes.Pause:
        return 'queue pause';

      default:
        return 'error';
    }
  }

  log(type: OperationTypes) {
    if (!this.logger) return;

    this.logger(`[${OperationTypes[type]}] ${this.builder(type)}`);
  }
}

export default LogBuilder;
