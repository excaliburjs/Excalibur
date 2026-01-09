import type { Meta, StoryObj } from '@storybook/html-vite';
import { Loader, Color, Actor, Vector, vec, toRadians } from '../engine';
import { ImageSource, Canvas } from '../engine/graphics';
import { withEngine } from './utils';

import heartBitmap from './assets/heart.png';

export default {
  title: 'Actors/Anchors'
} as Meta;

class Cross extends Actor {
  constructor(x: number, y: number) {
    super({ x, y, width: 40, height: 40 });
    this.graphics.onPreDraw = (ctx) => {
      ctx.save();
      // onPreDraw doesn't factor anchor anymore
      ctx.translate(-20, -20);
      ctx.debug.drawLine(vec(this.width / 2, 0), vec(this.width / 2, this.height), { color: Color.Black });
      ctx.debug.drawLine(vec(0, this.height / 2), vec(this.width, this.height / 2), { color: Color.Black });
      ctx.restore();
    };
  }

  onInitialize() {
    const canvas = new Canvas({
      draw: (ctx) => {
        ctx.beginPath();
        ctx.lineTo(this.width / 2, 0);
        ctx.lineTo(this.width / 2, this.height);
        ctx.strokeStyle = Color.Black.toString();
        ctx.stroke();
        ctx.closePath();

        ctx.beginPath();
        ctx.lineTo(0, this.height / 2);
        ctx.lineTo(this.width, this.height / 2);
        ctx.strokeStyle = Color.Black.toString();
        ctx.stroke();
        ctx.closePath();
      }
    });

    this.graphics.add(canvas);
  }
}
// Flags.enable(Legacy.LegacyDrawing);
export const Centered: StoryObj = {
  render: withEngine(async (game) => {
    const heartTx = new ImageSource(heartBitmap);
    const ldr = new Loader([heartTx]);

    game.backgroundColor = Color.White;
    game.screen.antialiasing = false;

    // center anchored actors
    const cc = new Cross(0, 0);
    const ca1 = new Actor({ width: 15, height: 15, color: Color.Red, anchor: Vector.Half });
    const ca2 = new Actor({ width: 10 * 2, height: 10 * 2, color: Color.Green, anchor: Vector.Half });
    const ca3 = new Actor({ width: 10, height: 10, color: Color.Blue, anchor: Vector.Half });
    const ca4 = new Actor({ width: 20 * 2, height: 20 * 2, anchor: Vector.Half });
    const heartSprite = heartTx.toSprite();
    heartSprite.scale.setTo(3, 3);
    ca4.graphics.add(heartSprite);
    ca4.angularVelocity = 0.5;
    ca3.rotation = toRadians(45);

    game.add(ca4);
    game.add(ca2);
    game.add(ca1);
    game.add(ca3);
    game.add(cc);

    game.currentScene.camera.strategy.lockToActor(cc);

    await game.start(ldr);
  })
};

export const TopLeft: StoryObj = {
  render: withEngine(async (game) => {
    const heartTx = new ImageSource(heartBitmap);
    const ldr = new Loader([heartTx]);

    game.backgroundColor = Color.White;
    game.screen.antialiasing = false;

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
    const heartSprite2 = heartTx.toSprite();
    heartSprite2.scale.setTo(3, 3);
    tla4.graphics.add(heartSprite2);
    tla3.rotation = toRadians(45);

    game.add(tla4);
    game.add(tla2);
    game.add(tla1);
    game.add(tla3);
    game.add(tlc);

    game.currentScene.camera.strategy.lockToActor(tlc);

    await game.start(ldr);
  })
};

export const TopRight: StoryObj = {
  render: withEngine(async (game) => {
    const heartTx = new ImageSource(heartBitmap);
    const ldr = new Loader([heartTx]);

    game.backgroundColor = Color.White;
    game.screen.antialiasing = false;

    // top right anchored actors
    const trc = new Cross(100, -100);
    const tra1 = new Actor({ x: 100, y: -100, width: 15, height: 15, color: Color.Red, anchor: new Vector(1, 0) });
    const tra2 = new Actor({ x: 100, y: -100, width: 10 * 2, height: 10 * 2, color: Color.Green, anchor: new Vector(1, 0) });
    const tra3 = new Actor({ x: 100, y: -100, width: 10, height: 10, color: Color.Blue, anchor: new Vector(1, 0) });
    const tra4 = new Actor({ x: 100, y: -100, width: 20 * 2, height: 20 * 2, anchor: new Vector(1, 0) });
    const heartSprite2 = heartTx.toSprite();
    heartSprite2.scale.setTo(3, 3);
    tra4.graphics.add(heartSprite2);
    tra3.rotation = toRadians(45);

    game.add(tra4);
    game.add(tra2);
    game.add(tra1);
    game.add(tra3);
    game.add(trc);

    game.currentScene.camera.strategy.lockToActor(trc);

    await game.start(ldr);
  })
};

export const BottomLeft: StoryObj = {
  render: withEngine(async (game) => {
    const heartTx = new ImageSource(heartBitmap);
    const ldr = new Loader([heartTx]);

    game.backgroundColor = Color.White;
    game.screen.antialiasing = false;

    // bottom left anchored actors
    const blc = new Cross(-100, 100);
    const bla1 = new Actor({ x: -100, y: 100, width: 15, height: 15, color: Color.Red, anchor: new Vector(0, 1) });
    const bla2 = new Actor({ x: -100, y: 100, width: 10 * 2, height: 10 * 2, color: Color.Green, anchor: new Vector(0, 1) });
    const bla3 = new Actor({ x: -100, y: 100, width: 10, height: 10, color: Color.Blue, anchor: new Vector(0, 1) });
    const bla4 = new Actor({ x: -100, y: 100, width: 20 * 2, height: 20 * 2, anchor: new Vector(0, 1) });
    const heartSprite2 = heartTx.toSprite();
    heartSprite2.scale.setTo(3, 3);
    bla4.graphics.add(heartSprite2);
    bla3.rotation = toRadians(45);

    game.add(bla4);
    game.add(bla2);
    game.add(bla1);
    game.add(bla3);
    game.add(blc);

    game.currentScene.camera.x = 0;
    game.currentScene.camera.y = 0;

    await game.start(ldr);
  })
};

export const BottomRight: StoryObj = {
  render: withEngine(async (game) => {
    const heartTx = new ImageSource(heartBitmap);
    const ldr = new Loader([heartTx]);

    game.backgroundColor = Color.White;
    game.screen.antialiasing = false;

    const brc = new Cross(100, 100);
    const bra1 = new Actor({ x: 100, y: 100, width: 15, height: 15, color: Color.Red, anchor: new Vector(1, 1) });
    const bra2 = new Actor({ x: 100, y: 100, width: 10 * 2, height: 10 * 2, color: Color.Green, anchor: new Vector(1, 1) });
    const bra3 = new Actor({ x: 100, y: 100, width: 10, height: 10, color: Color.Blue, anchor: new Vector(1, 1) });
    const bra4 = new Actor({ x: 100, y: 100, width: 20 * 2, height: 20 * 2, anchor: new Vector(1, 1) });
    const heartSprite2 = heartTx.toSprite();
    heartSprite2.scale.setTo(3, 3);
    bra4.graphics.add(heartSprite2);
    bra3.rotation = toRadians(45);

    game.add(bra4);
    game.add(bra2);
    game.add(bra1);
    game.add(bra3);
    game.add(brc);

    game.currentScene.camera.x = 0;
    game.currentScene.camera.y = 0;

    await game.start(ldr);
  })
};
