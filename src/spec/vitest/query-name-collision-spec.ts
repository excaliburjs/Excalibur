import * as ex from '@excalibur';

// Two different component classes that share a constructor name, which is what a minifying
// bundler produces (`class t extends Component` in two scopes or chunks) and what two files
// each declaring a `PlayerComponent` produce without any minification
function makeComponent() {
  class Occluder extends ex.Component {}
  return Occluder;
}
const ComponentA = makeComponent();
const ComponentB = makeComponent();

describe('Queries for components with the same constructor name', () => {
  it('should get distinct ids', () => {
    expect(ComponentA).not.toBe(ComponentB);
    expect(ComponentA.name).toBe(ComponentB.name);
    expect(new ex.Query([ComponentA]).id).not.toEqual(new ex.Query([ComponentB]).id);
    // but the same constructor always hashes the same so queries still dedupe
    expect(new ex.Query([ComponentA]).id).toEqual(new ex.Query([ComponentA]).id);
  });

  it('should not share a query in the world', () => {
    const world = new ex.World(new ex.Scene());
    const queryA = world.query([ComponentA, ex.TransformComponent]);
    const queryB = world.query([ComponentB, ex.TransformComponent]);
    expect(queryA).not.toBe(queryB);
    expect(world.query([ComponentA, ex.TransformComponent])).toBe(queryA);

    const entityWithB = new ex.Entity([new ComponentB(), new ex.TransformComponent()]);
    const added: ex.Entity[] = [];
    queryA.entityAdded$.subscribe((e) => added.push(e));
    world.add(entityWithB);

    // queryA must only see entities that actually have ComponentA
    expect(added).toHaveLength(0);
    expect(queryA.entities).toHaveLength(0);
    expect(queryB.entities).toEqual([entityWithB]);
  });
});
