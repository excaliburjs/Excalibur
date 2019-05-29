import * as ex from '../../build/dist/excalibur';
import { Mocks } from './util/Mocks';

describe('A Collision Group', () => {
  let scene;
  let actor1;
  let actor2;
  let engine: ex.Engine;
  const mock = new Mocks.Mocker();

  beforeEach(() => {
    actor1 = new ex.Actor(100, 100, 100, 100);
    actor2 = new ex.Actor(100, 100, 100, 100);
    // Setting actor collision types to passive otherwise they push each other around
    actor1.body.collider.type = ex.CollisionType.Passive;
    actor2.body.collider.type = ex.CollisionType.Passive;

    scene.add(actor1);
    scene.add(actor2);
    engine = mock.engine(0, 0);
    scene = new ex.Scene(engine);
    engine.currentScene = scene;
  });
});
