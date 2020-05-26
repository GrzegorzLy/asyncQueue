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

  private color(text: string, type: OperationTypes) {
    switch (type) {
      case OperationTypes.TaskError:
      case OperationTypes.TaskReject:
        return `\x1b[31m${text}\x1b[0m`;
      case OperationTypes.TaskDone:
        return `\x1b[32m${text}\x1b[0m`;
      case OperationTypes.QueuePush:
        return `\x1b[36m${text}\x1b[0m`;
      default:
        return text;
    }
  }

  error(error: Error, name?: string) {
    const base = this.base(OperationTypes.TaskError, name);
    this.logger(
      this.color(`${base}  error: ${error}`, OperationTypes.TaskError)
    );
  }

  log(type: OperationTypes, name?: string) {
    const base = this.base(type, name);
    this.logger(this.color(`${base} ${this.builder(type)}`, type));
  }
}

export default LogBuilder;
