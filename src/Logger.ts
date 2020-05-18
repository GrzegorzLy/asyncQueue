import {OperationTypes, Logger} from './types';

class LogBuilder {
  private logger: Logger;

  constructor(logger: Logger) {
    this.logger = logger;
  }

  private builder(type: OperationTypes) {
    switch (type) {
      case OperationTypes.TaskRun:
        return 'task is running';
      case OperationTypes.TaskDone:
        return 'task is done';
      case OperationTypes.TaskRetry:
        return 'the task has been repeated';
      case OperationTypes.TaskReject:
        return 'task rejected, too many attempts to retry';
      case OperationTypes.QueuePush:
        return 'task push to async queue';
      case OperationTypes.QueueResume:
        return 'queue resume';
      case OperationTypes.QueuePause:
        return 'queue pause';
      case OperationTypes.QueueEmpty:
        return 'queue is empty';

      default:
        return 'error';
    }
  }

  private base(type: OperationTypes, name?: string) {
    const operationType = `[${OperationTypes[type]}]`.padEnd(13, ' ');
    let base = `${operationType}${new Date().toISOString()}`;
    if (name) {
      base += ` name: ${name}`;
    }

    return base;
  }

  error(error: Error, name?: string) {
    const base = this.base(OperationTypes.TaskError, name);
    this.logger(`${base}  error: ${error}`);
  }

  log(type: OperationTypes, name?: string) {
    const base = this.base(type, name);
    this.logger(`${base} ${this.builder(type)}`);
  }
}

export default LogBuilder;
