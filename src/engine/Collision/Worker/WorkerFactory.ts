import source from './worker.js';
export class WorkerFactory {
  static startWorker(): Worker {
    return new Worker(URL.createObjectURL(new Blob([source], {type: 'text/javascript'})), {type: 'module'});
  }
}