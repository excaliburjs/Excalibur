export class SuperGifUtils {
  static bitsToNum(ba: any) {
    return ba.reduce(function(s: any, n: any) {
      return s * 2 + n;
    }, 0);
  }

  static byteToBitArr(bite: any) {
    let a = [];
    for (let i = 7; i >= 0; i--) {
      a.push(!!(bite & (1 << i)));
    }
    return a;
  }

  static lzwDecode(minCodeSize: any, data: any) {
    // TODO: Now that the GIF parser is a bit different, maybe this should get an array of bytes instead of a String?
    let pos = 0; // Maybe this streaming thing should be merged with the Stream?
    let readCode = function(size: any) {
      let code = 0;
      for (let i = 0; i < size; i++) {
        if (data.charCodeAt(pos >> 3) & (1 << (pos & 7))) {
          code |= 1 << i;
        }
        pos++;
      }
      return code;
    };

    let output: any = [];

    let clearCode = 1 << minCodeSize;
    let eoiCode = clearCode + 1;

    let codeSize = minCodeSize + 1;

    let dict: any = [];

    let clear = function() {
      dict = [];
      codeSize = minCodeSize + 1;
      for (let i = 0; i < clearCode; i++) {
        dict[i] = [i];
      }
      dict[clearCode] = [];
      dict[eoiCode] = null;
    };

    let code;
    let last;

    while (true) {
      last = code;
      code = readCode(codeSize);

      if (code === clearCode) {
        clear();
        continue;
      }
      if (code === eoiCode) break;

      if (code < dict.length) {
        if (last !== clearCode) {
          dict.push(dict[last].concat(dict[code][0]));
        }
      } else {
        if (code !== dict.length) throw new Error('Invalid LZW code.');
        dict.push(dict[last].concat(dict[last][0]));
      }
      output.push.apply(output, dict[code]);

      if (dict.length === 1 << codeSize && codeSize < 12) {
        // If we're at the last code and codeSize is 12, the next code will be a clearCode, and it'll be 12 bits long.
        codeSize++;
      }
    }

    // I don't know if this is technically an error, but some GIFs do it.
    //if (Math.ceil(pos / 8) !== data.length) throw new Error('Extraneous LZW bytes.');
    return output;
  }
}
