import { Actor, Component, Entity, vec, Vector } from "excalibur";
import { lifeBarSS } from "../resources";  // <-- import sprite sheet as you normally would

export class HealthBar extends Component {
  _currentHealth: number;
  _maxHealth: number;
  _childActor: Actor | null = null;

  constructor(maxHealth: number) {
    super();
    this._maxHealth = maxHealth;
    this._currentHealth = maxHealth;
  }

  init() {}

  get healthRatio(): number {
    return this._currentHealth / this._maxHealth;
  }

  get health(): number {
    return this._currentHealth;
  }

  get maxHealth(): number {
    return this._maxHealth;
  }

  set maxHealth(value: number) {
    this._maxHealth = value;
  }

  set health(value: number) {
    this._currentHealth = value;
  }

  onAdd = (owner: Entity) => {
    // things to do
    // create child entity for owner
    if (this._childActor !== null) this._childActor = null;

    class HealthBarActor extends Actor {
      constructor(pos: Vector) {
        super({
          pos,
        });

        this.graphics.use(lifeBarSS.getSprite(0, 24));
      }
    }

    this._childActor = new HealthBarActor(vec(0, -25));
    owner.addChild(this._childActor);
    console.log(owner);

    owner.on("preupdate", () => this.update());
  };
  onRemove(previousOwner: Entity): void {
    if (this._childActor !== null) {
      previousOwner.removeChild(this._childActor);
      this._childActor = null;
    }
    previousOwner.off("preupdate", () => this.update());
  }

  update() {
    const healthRatio = this.healthRatio;
    // the y index of setSprite should be tied to the health ratio i.e. ratio of 100% should be index 24, and 0 should be 0
    this._childActor!.graphics.use(lifeBarSS.getSprite(0, Math.floor(healthRatio * 26)));
  }
}
