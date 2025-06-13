type BoxEvents = ex.EntityEvents & {
  pointerdown: PointerEvent;
};

const BoxEvents = {
  PointerDown: 'pointerdown'
} as const;

class Box extends ex.Entity implements ex.Eventable, ex.PointerEvents, ex.CanInitialize, ex.CanUpdate {
  public events = new ex.EventEmitter<BoxEvents>();
  public readonly transform: ex.TransformComponent;
  public readonly collider: ex.ColliderComponent;
  public readonly pointer: ex.PointerComponent;
  graphics: ex.GraphicsComponent;
  body: ex.BodyComponent;

  constructor() {
    super();

    console.log('box');
    this.transform = new ex.TransformComponent();
    this.transform.pos = ex.vec(0, 0);
    this.addComponent(this.transform);

    this.collider = new ex.ColliderComponent(ex.Shape.Box(100, 100));
    this.addComponent(this.collider);

    this.body = new ex.BodyComponent();
    this.addComponent(this.body);

    //this.graphics = new ex.GraphicsComponent();
    //this.addComponent(this.graphics);
    //this.graphics.use(new ex.Rectangle({ width: 100, height: 100 }));

    this.pointer = new ex.PointerComponent({ useColliderShape: true });
    this.addComponent(this.pointer);
  }

  public emit<TEventName extends ex.EventKey<BoxEvents>>(eventName: TEventName, event: BoxEvents[TEventName]): void {
    console.log(eventName);
    this.events.emit(eventName, event);
  }
  public on<TEventName extends ex.EventKey<BoxEvents>>(eventName: TEventName, handler: ex.Handler<BoxEvents[TEventName]>): ex.Subscription {
    return this.events.on(eventName, handler);
  }
  public once<TEventName extends ex.EventKey<BoxEvents>>(
    eventName: TEventName,
    handler: ex.Handler<BoxEvents[TEventName]>
  ): ex.Subscription {
    return this.events.once(eventName, handler);
  }

  override onInitialize(engine: ex.Engine<any>): void {
    // this does not trigger
    this.on('pointerdown', console.log);
  }

  override onPostUpdate(engine: ex.Engine<any>, elapsed: number): void {
    ex.Debug.drawBounds(this.collider.bounds, { color: ex.Color.Pink });
  }
}

class BoxContainer extends ex.Scene {
  override onInitialize(engine: ex.Engine<any>): void {
    this.add(new Box());
  }
}

var game52 = new ex.Engine({
  width: 500,
  height: 500,
  displayMode: ex.DisplayMode.Fixed,
  scenes: {
    boxContainer: BoxContainer
  }
});

async function start() {
  await game52.start();
  await game52.goToScene('boxContainer');
  game52.toggleDebug();
}

start().catch(console.error);
