import { Component } from "../EntityComponentSystem";

export class LegacyDrawComponent extends Component<'legacydraw'> {
  public readonly type = 'legacydraw';
}