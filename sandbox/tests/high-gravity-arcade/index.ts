/// <reference path='../../lib/excalibur.d.ts' />
const Category = {
  Ground: ex.CollisionGroupManager.create('ground'),
  Player: ex.CollisionGroupManager.create('player')
} as const;

const CollisionGroup = {
  Ground: Category.Ground,
  Player: ex.CollisionGroup.collidesWith([Category.Ground])
} as const;

class TouchingComponent extends ex.Component {
  declare owner: ex.Actor;
  type = 'touching';

  origin: ex.Vector = ex.Vector.Zero;

  private contacts = new Map<
    string,
    {
      contact: ex.CollisionContact;
      actor: ex.Actor;
      side: ex.Side;
    }
  >();

  [ex.Side.Left] = new Set<ex.Actor>();
  [ex.Side.Right] = new Set<ex.Actor>();
  [ex.Side.Top] = new Set<ex.Actor>();
  [ex.Side.Bottom] = new Set<ex.Actor>();

  /**
   * Entities that are touching this entity but are not solid. They are
   * not tracked by side because they can move through the entity.
   */
  passives = new Set<ex.Actor>();

  onAdd(owner: ex.Actor): void {
    super.onAdd?.(owner);
    this.origin = new ex.Vector(owner.pos.x, owner.pos.y);
    // collect up all of the collisionstart/end events for each frame
    owner.on('collisionstart', (ev) => {
      if (ev.other) {
        // console.log(ev.contact.colliderA.worldPos, ev.contact.colliderB.worldPos)
        if (ev.other.owner.body?.collisionType === ex.CollisionType.Passive) {
          this.passives.add(ev.other.owner);
        } else {
          const side = ev.side;

          this.contacts.set(ev.contact.id, {
            contact: ev.contact,
            actor: ev.other.owner,
            side
          });
          this.updateSides();
        }
      }
    });

    owner.on('collisionend', (ev) => {
      if (ev.other.owner.body?.collisionType === ex.CollisionType.Passive) {
        this.passives.delete(ev.other.owner);
      } else {
        this.contacts.delete(ev.lastContact.id);
        this.updateSides();
      }
    });
  }

  private updateSides() {
    this[ex.Side.Left].clear();
    this[ex.Side.Right].clear();
    this[ex.Side.Top].clear();
    this[ex.Side.Bottom].clear();

    for (const { side, actor } of this.contacts.values()) {
      this[side].add(actor);
    }
  }
}

class MobilityComponent extends ex.Component {
  acc = new ex.Vector(500, 500);
  gravity = 1450;
  // terminal velocity
  max = new ex.Vector(150, 150);
  damp = { x: 0.92, y: 1 };
  jump = 500;
  constructor() {
    super();
  }
}

class ControlSystem extends ex.System {
  query: ex.Query<typeof ex.BodyComponent | typeof MobilityComponent>;
  input: ex.InputHost;
  public systemType = ex.SystemType.Update;
  public priority = ex.SystemPriority.Highest;

  controls = {
    Left: [ex.Keys.A, ex.Buttons.DpadLeft],
    Right: [ex.Keys.D, ex.Buttons.DpadRight],
    Up: [ex.Keys.W, ex.Buttons.DpadUp],
    Down: [ex.Keys.S, ex.Buttons.DpadDown],
    Jump: [ex.Keys.Space, ex.Buttons.Face1],
    Attack: [ex.Keys.E, ex.Buttons.Face3]
  } as const;

  constructor(world: ex.World, input: ex.InputHost) {
    super();
    this.query = world.query([ex.BodyComponent, MobilityComponent]);
    this.input = input;
  }

  public update(elapsedMs) {
    if (!this.input) return;
    /**
     * get user controls intent
     */
    const intent = {
      Left: this.isHeld('Left'),
      Right: this.isHeld('Right'),
      Up: this.isHeld('Up'),
      Down: this.isHeld('Down'),
      Jump: this.isHeld('Jump'),
      Attack: this.isHeld('Attack')
    };

    for (const entity of this.query.entities) {
      const mobility = entity.get(MobilityComponent);
      const body = entity.get(ex.BodyComponent);
      const touching = entity.get(TouchingComponent);
      const grounded = touching.Bottom.size > 0;

      const acc = this.computeAcceleration(mobility, intent);
      grounded ? (acc.y = 0) : (acc.y = mobility.gravity);

      body.acc = acc;
      if (grounded) {
        let x = body.vel.x;
        let y = 0;
        if (intent.Jump) {
          x *= 2;
          y = -mobility.jump;
        }
        x *= mobility.damp.x;
        x = ex.clamp(x, -mobility.max.x, mobility.max.x);
        body.vel = new ex.Vector(x, y);
      }
    }
  }

  /**
   * compute movement that should be applied to the body
   * based on the user's intent and the mobility properties
   */
  private computeAcceleration(mobility: MobilityComponent, intent: Record<keyof typeof this.controls, boolean>) {
    //the horizontal intent
    const x = (intent.Right ? 1 : 0) - (intent.Left ? 1 : 0);
    //the vertical intent
    const y = (intent.Down ? 1 : 0) - (intent.Up ? 1 : 0);
    const acc = new ex.Vector(x * mobility.acc.x, y * mobility.acc.y);

    return acc;
  }

  isHeld(control: keyof typeof this.controls) {
    const [key, button] = this.controls[control];

    return Boolean(this.input.keyboard.isHeld(key) || this.getGamepad()?.isButtonHeld(button));
  }

  getGamepad() {
    return [this.input.gamepads.at(0), this.input.gamepads.at(1), this.input.gamepads.at(2), this.input.gamepads.at(3)].find(
      (g) => g.connected
    );
  }
}

class PlayerActor extends ex.Actor {
  constructor({ x = 120, y = 80 }: { x?: number; y?: number } = {}) {
    super({
      x,
      y,
      width: 20,
      height: 20,
      // Let's give it some color with one of the predefined
      // color constants
      color: ex.Color.Black,
      collisionType: ex.CollisionType.Active,
      collisionGroup: CollisionGroup.Player
    });
  }
  onInitialize(engine: ex.Engine): void {
    this.body.friction = 0.9;
    this.body.useGravity = true;
    this.addComponent(new MobilityComponent());
    this.addComponent(new TouchingComponent());
  }

  test = false;
  onPostUpdate(engine: ex.Engine, delta: number): void {
    if (this.body.vel.y > 220 && !this.test) {
      // engine.clock.stop();
      // engine.clock = engine.clock.toTestClock();
      // engine.clock.start();
      this.test = true;
    }
  }

  // onPreCollisionResolve(self: Collider, other: Collider, side: Side, contact: CollisionContact): void {
  //   if (side === Side.Bottom) {
  //     self.owner.get(BodyComponent).vel.y = 0;
  //   }
  //   if (side === Side.Left || side === Side.Right) {
  //     self.owner.get(BodyComponent).vel.x = 0;
  //   }
  // }
}

class Terrain extends ex.Actor {
  constructor({ x = 120, y = 120, width = 128, height = 16 }: { x?: number; y?: number; width?: number; height?: number } = {}) {
    super({
      x,
      y,
      width,
      height,
      // Let's give it some color with one of the predefined
      // color constants
      color: ex.Color.White,
      collisionType: ex.CollisionType.Fixed,
      collisionGroup: CollisionGroup.Ground
    });
  }
}

class MenuScene extends ex.Scene {
  onInitialize(): void {
    // const gl = this.engine.canvas.getContext('webgl2');
    // new Shader({ fragmentSource, vertexSource, gl });
    this.add(new PlayerActor());
    this.add(new Terrain());
    this.add(new Terrain({ x: 204, y: 100, width: 8, height: 140 }));
    this.world.add(new ControlSystem(this.world, this.engine.input));
  }
}

const computeScaling = (resolution: ex.ViewportDimension): ex.ViewportDimension => {
  const scale = Math.min(Math.floor(window.innerWidth / resolution.width), Math.floor(window.innerHeight / resolution.height));
  return {
    width: resolution.width * scale,
    height: resolution.height * scale
  };
};

var game = new ex.Engine({
  resolution: ex.Resolution.GameBoyAdvance,
  viewport: computeScaling(ex.Resolution.GameBoyAdvance),
  suppressHiDPIScaling: true,
  // suppressPlayButton: true,
  displayMode: ex.DisplayMode.Fixed,
  antialiasing: false,
  physics: {
    substep: 4,
    arcade: {
      contactSolveBias: ex.ContactSolveBias.VerticalFirst
    },
    solver: ex.SolverStrategy.Arcade,
    colliders: {
      compositeStrategy: 'separate'
    },
    continuous: {
      checkForFastBodies: true
    }
  },
  fixedUpdateFps: 60
  // maxFps: 60
});

game.showDebug(true);

/**
 * we don't care about the resize event, we only care about the performant callback
 * when any resize happens
 */
const ro = new ResizeObserver((entries) => {
  const newViewport = computeScaling(ex.Resolution.GameBoyAdvance);
  if (newViewport.width !== game.screen.viewport.width || newViewport.height !== game.screen.viewport.height) {
    game.screen.viewport = newViewport;
    game.screen.applyResolutionAndViewport();
  }
});
ro.observe(document.body);

game.add('menu', new MenuScene());
game.start().then(() => {
  game.goToScene('menu');
});
