import { Component } from '../component';

export class TagsComponent extends Component {
  // @ts-ignore
  private static _NAME = 'TagsComponent';
  public tags = new Set<string>();
}
