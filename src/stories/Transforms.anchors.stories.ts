import { Texture, Loader, Color, Actor, Util, Vector } from '../engine';
import { withEngine } from './utils';

import heartBitmap from './assets/heart.png';

export default {
  title: 'Transforms/Anchors'
};

class Cross extends Actor {
  constructor(x: number, y: number) {
    super(x, y, 40, 40);
  }

  onPreDraw(ctx: CanvasRenderingContext2D) {
    ctx.beginPath();
    ctx.lineTo(this.getWidth() / 2, 0);
    ctx.lineTo(this.getWidth() / 2, this.getHeight());
    ctx.strokeStyle = Color.Black.toString();
    ctx.stroke();
    ctx.closePath();

    ctx.beginPath();
    ctx.lineTo(0, this.getHeight() / 2);
    ctx.lineTo(this.getWidth(), this.getHeight() / 2);
    ctx.strokeStyle = Color.Black.toString();
    ctx.stroke();
    ctx.closePath();
  }
}

export const centered = withEngine(async (game) => {
  const heartTx = new Texture(heartBitmap);
  const ldr = new Loader([heartTx]);

  game.backgroundColor = Color.White;
  game.setAntialiasing(false);

  // center anchored actors
  const cc = new Cross(0, 0);
  const ca1 = new Actor({ width: 15, height: 15, color: Color.Red, anchor: Vector.Half });
  const ca2 = new Actor({ width: 10 * 2, height: 10 * 2, color: Color.Green, anchor: Vector.Half });
  const ca3 = new Actor({ width: 10, height: 10, color: Color.Blue, anchor: Vector.Half });
  const ca4 = new Actor({ width: 20 * 2, height: 20 * 2, anchor: Vector.Half });
  const heartSprite = heartTx.asSprite();
  heartSprite.scale.setTo(3, 3);
  ca4.addDrawing(heartSprite);
  ca4.rx = 0.5;
  ca3.rotation = Util.toRadians(45);

  game.add(ca4);
  game.add(ca2);
  game.add(ca1);
  game.add(ca3);
  game.add(cc);

  game.currentScene.camera.x = 0;
  game.currentScene.camera.y = 0;

  await game.start(ldr);
});

export const topLeft = withEngine(async (game) => {
  const heartTx = new Texture(heartBitmap);
  const ldr = new Loader([heartTx]);

  game.backgroundColor = Color.White;
  game.setAntialiasing(false);

  // top left anchored actors
  const tlc = new Cross(-100, -100);
  const tla1 = new Actor({
    pos: new Vector(-100, -100),
    width: 15,
    height: 15,
    color: Color.Red,
    anchor: Vector.Zero
  });
  const tla2 = new Actor({
    pos: new Vector(-100, -100),
    width: 10 * 2,
    height: 10 * 2,
    color: Color.Green,
    anchor: Vector.Zero
  });
  const tla3 = new Actor({
    pos: new Vector(-100, -100),
    width: 10,
    height: 10,
    color: Color.Blue,
    anchor: Vector.Zero
  });
  const tla4 = new Actor({
    pos: new Vector(-100, -100),
    width: 20 * 2,
    height: 20 * 2,
    anchor: Vector.Zero
  });
  const heartSprite2 = heartTx.asSprite();
  heartSprite2.scale.setTo(3, 3);
  tla4.addDrawing(heartSprite2);
  tla3.rotation = Util.toRadians(45);

  game.add(tla4);
  game.add(tla2);
  game.add(tla1);
  game.add(tla3);
  game.add(tlc);

  game.currentScene.camera.x = 0;
  game.currentScene.camera.y = 0;

  await game.start(ldr);
});

export const topRight = withEngine(async (game) => {
  const heartTx = new Texture(heartBitmap);
  const ldr = new Loader([heartTx]);

  game.backgroundColor = Color.White;
  game.setAntialiasing(false);

  // top right anchored actors
  const trc = new Cross(100, -100);
  const tra1 = new Actor({ x: 100, y: -100, width: 15, height: 15, color: Color.Red, anchor: new Vector(1, 0) });
  const tra2 = new Actor({ x: 100, y: -100, width: 10 * 2, height: 10 * 2, color: Color.Green, anchor: new Vector(1, 0) });
  const tra3 = new Actor({ x: 100, y: -100, width: 10, height: 10, color: Color.Blue, anchor: new Vector(1, 0) });
  const tra4 = new Actor({ x: 100, y: -100, width: 20 * 2, height: 20 * 2, anchor: new Vector(1, 0) });
  const heartSprite2 = heartTx.asSprite();
  heartSprite2.scale.setTo(3, 3);
  tra4.addDrawing(heartSprite2);
  tra3.rotation = Util.toRadians(45);

  game.add(tra4);
  game.add(tra2);
  game.add(tra1);
  game.add(tra3);
  game.add(trc);

  game.currentScene.camera.x = 0;
  game.currentScene.camera.y = 0;

  await game.start(ldr);
});

export const bottomLeft = withEngine(async (game) => {
  const heartTx = new Texture(heartBitmap);
  const ldr = new Loader([heartTx]);

  game.backgroundColor = Color.White;
  game.setAntialiasing(false);

  // bottom left anchored actors
  const blc = new Cross(-100, 100);
  const bla1 = new Actor({ x: -100, y: 100, width: 15, height: 15, color: Color.Red, anchor: new Vector(0, 1) });
  const bla2 = new Actor({ x: -100, y: 100, width: 10 * 2, height: 10 * 2, color: Color.Green, anchor: new Vector(0, 1) });
  const bla3 = new Actor({ x: -100, y: 100, width: 10, height: 10, color: Color.Blue, anchor: new Vector(0, 1) });
  const bla4 = new Actor({ x: -100, y: 100, width: 20 * 2, height: 20 * 2, anchor: new Vector(0, 1) });
  const heartSprite2 = heartTx.asSprite();
  heartSprite2.scale.setTo(3, 3);
  bla4.addDrawing(heartSprite2);
  bla3.rotation = Util.toRadians(45);

  game.add(bla4);
  game.add(bla2);
  game.add(bla1);
  game.add(bla3);
  game.add(blc);

  game.currentScene.camera.x = 0;
  game.currentScene.camera.y = 0;

  await game.start(ldr);
});

export const bottomRight = withEngine(async (game) => {
  const heartTx = new Texture(heartBitmap);
  const ldr = new Loader([heartTx]);

  game.backgroundColor = Color.White;
  game.setAntialiasing(false);

  const brc = new Cross(100, 100);
  const bra1 = new Actor({ x: 100, y: 100, width: 15, height: 15, color: Color.Red, anchor: new Vector(1, 1) });
  const bra2 = new Actor({ x: 100, y: 100, width: 10 * 2, height: 10 * 2, color: Color.Green, anchor: new Vector(1, 1) });
  const bra3 = new Actor({ x: 100, y: 100, width: 10, height: 10, color: Color.Blue, anchor: new Vector(1, 1) });
  const bra4 = new Actor({ x: 100, y: 100, width: 20 * 2, height: 20 * 2, anchor: new Vector(1, 1) });
  const heartSprite2 = heartTx.asSprite();
  heartSprite2.scale.setTo(3, 3);
  bra4.addDrawing(heartSprite2);
  bra3.rotation = Util.toRadians(45);

  game.add(bra4);
  game.add(bra2);
  game.add(bra1);
  game.add(bra3);
  game.add(brc);

  game.currentScene.camera.x = 0;
  game.currentScene.camera.y = 0;

  await game.start(ldr);
});
