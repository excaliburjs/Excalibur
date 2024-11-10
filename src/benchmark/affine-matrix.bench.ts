/// <reference lib="dom" />
import { AffineMatrix } from '../engine/Math/affine-matrix.ts';

// Deno.bench({
//   name: "Affine Matrix Clone - loop",
//   fn: (ctx) => {
//     const matrices: AffineMatrix[] = new Array(1_000_000).fill(AffineMatrix.identity());
//     for (let i = 0; i < matrices.length; i++) {
//       matrices[i].data[0] = Math.random();
//       matrices[i].data[1] = Math.random();
//       matrices[i].data[2] = Math.random();
//       matrices[i].data[3] = Math.random();
//       matrices[i].data[4] = Math.random();
//       matrices[i].data[5] = Math.random();
//     };
//     ctx.start();
//     for (let i = 0; i < matrices.length; i++) {
//       const dest = matrices[Math.floor(Math.random() * matrices.length)];
//       matrices[i].clone_loop(dest);
//     }
//     ctx.end();
//   }
// })

Deno.bench({
  name: 'Affine Matrix Clone - unrolled',
  baseline: true,
  fn: (ctx) => {
    const matrices: AffineMatrix[] = new Array(1_000_000).fill(AffineMatrix.identity());
    for (let i = 0; i < matrices.length; i++) {
      matrices[i].data[0] = Math.random();
      matrices[i].data[1] = Math.random();
      matrices[i].data[2] = Math.random();
      matrices[i].data[3] = Math.random();
      matrices[i].data[4] = Math.random();
      matrices[i].data[5] = Math.random();
    }

    ctx.start();
    for (let i = 0; i < matrices.length; i++) {
      const dest = matrices[Math.floor(Math.random() * matrices.length)];
      matrices[i].clone(dest);
    }
    ctx.end();
  }
});
