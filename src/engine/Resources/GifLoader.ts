import { Class } from '../Class';
import { ILoadable } from '../Interfaces/ILoadable';
import { Promise } from '../Promises';
import { Engine } from '../Engine';

export class GifLoader extends Class implements ILoadable {
  private _arrayBuffer: ArrayBuffer = null;
  private _blob: Blob = null;

  constructor(blob: Blob) {
    super();
    this._blob = blob;
  }

  load(): Promise<String | ArrayBuffer> {
    var complete = new Promise<String | ArrayBuffer>();

    var fileReader: FileReader = new FileReader();
    var arrayBuffer: ArrayBuffer = new ArrayBuffer(this._blob.size);
    fileReader.onload = (e: any) => {
      arrayBuffer = e.target.result;
      this._arrayBuffer = arrayBuffer;
    };
    fileReader.readAsArrayBuffer(this._blob);
    console.log(arrayBuffer);
    return complete;
  }
  getData() {
    return this._arrayBuffer;
  }
  setData(data: any): void {
    this._blob = data;
    this.load();
  }
  processData(data: any) {
    console.log(data);
  }
  wireEngine(engine: Engine): void {
    console.log(engine);
  }
  onprogress: (e: any) => void;
  oncomplete: () => void;
  onerror: (e: any) => void;
  isLoaded(): boolean {
    throw new Error('Method not implemented.');
  }
}
