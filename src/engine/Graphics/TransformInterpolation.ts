import { Transform } from "../Math/transform";

export function blendTransform(oldTx: Transform, newTx: Transform, blend: number, target?: Transform): Transform {
  let interpolatedPos = newTx.pos;
  let interpolatedScale = newTx.scale;
  let interpolatedRotation = newTx.rotation;
  
  interpolatedPos = newTx.pos.scale(blend).add(
    oldTx.pos.scale(1.0 - blend)
  );
  interpolatedScale = newTx.scale.scale(blend).add(
    oldTx.scale.scale(1.0 - blend)
  );
  // Rotational lerp https://stackoverflow.com/a/30129248
  const cosine = (1.0 - blend) * Math.cos(oldTx.rotation) + blend * Math.cos(newTx.rotation);
  const sine = (1.0 - blend) * Math.sin(oldTx.rotation) + blend * Math.sin(newTx.rotation);
  interpolatedRotation = Math.atan2(sine, cosine);

  const tx = target ?? new Transform();
  tx.setTransform(interpolatedPos, interpolatedRotation, interpolatedScale);
  return tx;
}