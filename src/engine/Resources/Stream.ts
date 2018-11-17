export class SuperGifStream {
  private position = 0;

  constructor(private data: any) {}

  readByte() {
    if (this.position >= this.data.length) {
      throw new Error('Attempted to read past end of stream.');
    }

    if (this.data instanceof Uint8Array) {
      return this.data[this.position++];
    } else {
      return this.data.charCodeAt(this.position++) & 0xff;
    }
  }

  readBytes(n: any) {
    let bytes = [];
    for (let i = 0; i < n; i++) {
      bytes.push(this.readByte());
    }
    return bytes;
  }

  read(n: number) {
    let s = '';
    for (let i = 0; i < n; i++) {
      s += String.fromCharCode(this.readByte());
    }
    return s;
  }

  readUnsigned() {
    // Little-endian.
    let a = this.readBytes(2);
    return (a[1] << 8) + a[0];
  }
}
