import { Component } from '../EntityComponentSystem/Component';
import type { Vector } from '../Math/vector';
import { vec } from '../Math/vector';

export class ParallaxComponent extends Component {
  parallaxFactor = vec(1.0, 1.0);

  constructor(parallaxFactor?: Vector) {
    super();
    this.parallaxFactor = parallaxFactor ?? this.parallaxFactor;
  }
}
