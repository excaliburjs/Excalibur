import { Component } from '../entity-component-system/component';
import type { Vector } from '../math/vector';
import { vec } from '../math/vector';

export class ParallaxComponent extends Component {
  parallaxFactor = vec(1.0, 1.0);

  constructor(parallaxFactor?: Vector) {
    super();
    this.parallaxFactor = parallaxFactor ?? this.parallaxFactor;
  }
}
