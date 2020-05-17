import {OperationTypes, Logger} from './types';

class LogBuilder {
  private logger: Logger;

  constructor(logger: Logger) {
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
      case OperationTypes.Resume:
        return 'queue resume';
      case OperationTypes.Pause:
        return 'queue pause';
      case OperationTypes.QueueEmpty:
        return 'queue is empty';

      default:
        return 'error';
    }
  }

  log(type: OperationTypes, name?: string) {
    let base = `[${OperationTypes[type]}] ${new Date().toISOString()}`;
    if (name) {
      base += ` name: ${name}`;
    }

    this.logger(`${base}  ${this.builder(type)}`);
  }
}

export default LogBuilder;
