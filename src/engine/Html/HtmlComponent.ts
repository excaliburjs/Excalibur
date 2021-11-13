import { Entity } from '../EntityComponentSystem';
import { Component } from '../EntityComponentSystem/Component';


export interface HtmlComponentOptions {
  render: () => HTMLElement;
}
export class HtmlComponent extends Component<'ex.html'> {
  public readonly type = 'ex.html' as const;
  owner?: Entity;
  html: HTMLElement;
  private _render: () => HTMLElement;
  constructor(options: HtmlComponentOptions) {
    super();
    this._render = options.render;
  }

  buildHtml(): HTMLElement {
    return this._render();
  }

  onAdd(_owner: Entity): void {
    this.html = this.buildHtml();
    document.body.appendChild(this.html);
  }
}