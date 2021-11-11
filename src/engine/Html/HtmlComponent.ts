import { Entity } from "../EntityComponentSystem";
import { Component } from "../EntityComponentSystem/Component";

export class HtmlComponent extends Component<'ex.html'> {
  public readonly type = 'ex.html' as const;
  owner?: Entity;
  html: HTMLElement;
  buildHtml(): HTMLElement {
    const element = document.createElement('div');
    element.innerText = 'Hello Div';
    element.style.position = 'absolute';
    return element;
  }

  onAdd(_owner: Entity): void {
    this.html = this.buildHtml();
    document.body.appendChild(this.html);
  }
}