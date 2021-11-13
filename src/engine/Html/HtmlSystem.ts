import { Scene, TransformComponent, Vector } from '..';
import { Entity } from '../EntityComponentSystem';
import { System, SystemType } from '../EntityComponentSystem/System';
import { HtmlComponent } from './HtmlComponent';
import { Screen } from '../Screen';


export class HtmlSystem extends System<TransformComponent | HtmlComponent> {
  public readonly types = ['ex.transform', 'ex.html'] as const;
  systemType = SystemType.Draw;

  private _screen: Screen;
  initialize(scene: Scene) {
    this._screen = scene.engine.screen;
  }
  update(entities: Entity[], _delta: number): void {
    let transform: TransformComponent;
    let html: HtmlComponent;
    let pageCoords: Vector;
    for (let entity of entities) {
      transform = entity.get(TransformComponent);
      html = entity.get(HtmlComponent);
      pageCoords = this._screen.worldToPageCoordinates(transform.pos);
      if (html?.html) {
        html.html.style.position = 'absolute';
        html.html.style.left = `${pageCoords.x}px`;
        html.html.style.top = `${pageCoords.y}px`;
      }
    }
  }
}