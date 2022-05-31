
export class SharedBuffer {
  buffer = new ArrayBuffer(4 * 13 * 5000);
  private _sent = false;
  send() {
    if (this._sent) {
      throw Error("Have not received the buffer");
    }
    this._sent = true;
  }

  receive(_buffer: ArrayBuffer) {
    this.buffer = _buffer;
    // this.buffer = new ArrayBuffer(4 * 13 * 5000)
    this._sent = false
  }
}