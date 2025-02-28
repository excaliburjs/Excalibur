import { Color } from '../../Color';
import { Vector } from '../../Math';

export const glsl = (x: TemplateStringsArray, ...args: (Color | Vector)[]) => {
  // TODO add version string?
  // TODO add premult

  let result = '';
  for (let i = 0; i < x.length; i++) {
    result += x[i];
    const val = args[i];
    if (val instanceof Color) {
      result += `vec4(${val.r / 255},${val.g / 255},${val.b / 255},${val.a})`;
    } else if (val instanceof Vector) {
      result += `vec4(${val.x},${val.y},0.,0.)`;
    }
  }

  return result;
};
