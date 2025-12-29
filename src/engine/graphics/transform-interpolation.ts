import { Transform } from '../math/transform';

/**
 * Blend 2 transforms for interpolation, will interpolate from the context of newTx's parent if it exists
 */
export function blendTransform(oldTx: Transform, newTx: Transform, blend: number, target?: Transform): Transform {
  if (oldTx.parent !== newTx.parent) {
    // Caller expects a local transform
    // Adjust old tx to be local to the new parent whatever that is
    const oldTxWithNewParent = oldTx.clone();
    const oldGlobalPos = oldTx.globalPos.clone();
    const oldGlobalScale = oldTx.globalScale.clone();
    const oldGlobalRotation = oldTx.globalRotation;
    oldTxWithNewParent.parent = newTx.parent;
    oldTxWithNewParent.globalPos = oldGlobalPos;
    oldTxWithNewParent.globalScale = oldGlobalScale;
    oldTxWithNewParent.globalRotation = oldGlobalRotation;
    oldTx = oldTxWithNewParent;
  }
  let interpolatedPos = newTx.pos;
  let interpolatedScale = newTx.scale;
  let interpolatedRotation = newTx.rotation;

  interpolatedPos = newTx.pos.scale(blend).add(oldTx.pos.scale(1.0 - blend));
  interpolatedScale = newTx.scale.scale(blend).add(oldTx.scale.scale(1.0 - blend));
  // Rotational lerp https://stackoverflow.com/a/30129248
  const cosine = (1.0 - blend) * Math.cos(oldTx.rotation) + blend * Math.cos(newTx.rotation);
  const sine = (1.0 - blend) * Math.sin(oldTx.rotation) + blend * Math.sin(newTx.rotation);
  interpolatedRotation = Math.atan2(sine, cosine);

  const tx = target ?? new Transform();
  tx.setTransform(interpolatedPos, interpolatedRotation, interpolatedScale);
  return tx;
}

/**
 *
 */
export function blendGlobalTransform(oldTx: Transform, newTx: Transform, blend: number, target?: Transform): Transform {
  let interpolatedPos = newTx.globalPos;
  let interpolatedScale = newTx.globalScale;
  let interpolatedRotation = newTx.globalRotation;

  interpolatedPos = newTx.globalPos.scale(blend).add(oldTx.globalPos.scale(1.0 - blend));
  interpolatedScale = newTx.globalScale.scale(blend).add(oldTx.globalScale.scale(1.0 - blend));
  // Rotational lerp https://stackoverflow.com/a/30129248
  const cosine = (1.0 - blend) * Math.cos(oldTx.globalRotation) + blend * Math.cos(newTx.globalRotation);
  const sine = (1.0 - blend) * Math.sin(oldTx.globalRotation) + blend * Math.sin(newTx.globalRotation);
  interpolatedRotation = Math.atan2(sine, cosine);

  const tx = target ?? new Transform();
  tx.setTransform(interpolatedPos, interpolatedRotation, interpolatedScale);
  return tx;
}
