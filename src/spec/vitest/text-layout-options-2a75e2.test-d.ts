import { expectTypeOf, it } from 'vitest';
import type { Text, TextOptions } from '@excalibur';

it('accepts optional word wrapping in TextOptions and writable Text', () => {
  const options: TextOptions[] = [
    { text: 'ab cd', wordWrap: 'normal' },
    { text: 'ab cd', wordWrap: 'break-word' },
    { text: 'ab cd', wordWrap: undefined },
    { text: 'ab cd' }
  ];
  expectTypeOf(options).toEqualTypeOf<TextOptions[]>();
  expectTypeOf<'normal' | 'break-word' | undefined>().toExtend<TextOptions['wordWrap']>();
  expectTypeOf<'normal' | 'break-word' | undefined>().toExtend<Text['wordWrap']>();
  const graphic = {} as Text;
  graphic.wordWrap = 'normal';
  graphic.wordWrap = 'break-word';
  graphic.wordWrap = undefined;
});
