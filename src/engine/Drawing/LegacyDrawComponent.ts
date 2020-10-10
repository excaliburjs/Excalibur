import { Component } from '../EntityComponentSystem';

// TODO Call this canvas draw?
export class LegacyDrawComponent extends Component<'legacydraw'> {
  public readonly type = 'legacydraw';
}
