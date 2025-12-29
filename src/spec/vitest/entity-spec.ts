import * as ex from '@excalibur';
import { TestUtils } from '../__util__/test-utils';

class FakeComponentA extends ex.Component {}
class FakeComponentB extends ex.Component {}
class FakeComponentC extends ex.Component {}
class FakeComponentD extends ex.Component {}
class FakeComponentZ extends ex.Component {}

describe('An entity', () => {
  it('exists', () => {
    expect(ex.Entity).toBeDefined();
  });

  it('can be constructed with a list of components', () => {
    const e = new ex.Entity([new FakeComponentA(), new FakeComponentB(), new FakeComponentC()]);

    expect(e.has(FakeComponentA)).toBe(true);
    expect(e.has(FakeComponentB)).toBe(true);
    expect(e.has(FakeComponentC)).toBe(true);
  });

  it('can override existing components', () => {
    const original = new FakeComponentA();
    const e = new ex.Entity([original]);

    vi.spyOn(e, 'removeComponent');
    const newComponent = new FakeComponentA();
    e.addComponent(newComponent, true);
    expect(e.removeComponent).toHaveBeenCalledWith(FakeComponentA, true);
  });

  it('has a unique id', () => {
    const entity1 = new ex.Entity();
    const entity2 = new ex.Entity();
    const entity3 = new ex.Entity();
    expect(entity1.id).not.toBe(entity2.id);
    expect(entity1.id).not.toBe(entity3.id);
    expect(entity2.id).not.toBe(entity3.id);
  });

  it('can have a name', () => {
    const e = new ex.Entity([], 'my-name');
    expect(e.name).toBe('my-name');
  });

  it('can have a name set after construction', () => {
    const e = new ex.Entity();
    e.name = 'MyCoolName';
    expect(e.name).toBe('MyCoolName');
  });

  it('has a default name', () => {
    const e = new ex.Entity();
    expect(e.name).toMatch(/^Entity#\d+$/);
  });

  it('can be killed', () => {
    const entity = new ex.Entity();
    expect(entity.isKilled()).toBe(false);
    entity.kill();
    expect(entity.isKilled()).toBe(true);
  });

  it('can have types by component', () => {
    const entity = new ex.Entity();
    const typeA = new FakeComponentA();
    const typeB = new FakeComponentB();
    expect(entity.types).toEqual([]);

    entity.addComponent(typeA);
    expect(entity.types).toEqual([FakeComponentA]);
    entity.addComponent(typeB);
    expect(entity.types).toEqual([FakeComponentA, FakeComponentB]);
    entity.removeComponent(FakeComponentA, true);
    expect(entity.types).toEqual([FakeComponentB]);
    entity.removeComponent(FakeComponentB, true);
    expect(entity.types).toEqual([]);
  });

  it('can get a list of components', () => {
    const entity = new ex.Entity();
    const typeA = new FakeComponentA();
    const typeB = new FakeComponentB();
    const typeC = new FakeComponentC();

    expect(entity.getComponents()).toEqual([]);

    entity.addComponent(typeA).addComponent(typeB).addComponent(typeC);

    expect(entity.getComponents().sort((a, b) => a.constructor.name.localeCompare(b.constructor.name))).toEqual([typeA, typeB, typeC]);
  });

  it('can have type from tag components', () => {
    const entity = new ex.Entity();
    // const isOffscreen = new TagComponent('offscreen');
    const nonTag = new FakeComponentA();

    expect(entity.types).toEqual([]);
    entity.addTag('offscreen');
    entity.addComponent(nonTag);

    expect(entity.types).toEqual([FakeComponentA]);
    expect(entity.tags).toEqual(new Set(['offscreen']));
    expect(entity.hasTag('offscreen')).toBe(true);
  });

  it('can add and remove tags', () => {
    const entity = new ex.Entity();
    entity.addTag('someTag1');
    entity.addTag('someTag2');
    entity.addTag('someTag3');

    expect(entity.tags).toEqual(new Set(['someTag1', 'someTag2', 'someTag3']));
    entity.removeTag('someTag3');

    expect(entity.tags).toEqual(new Set(['someTag1', 'someTag2']));
    entity.removeTag('someTag2');
    expect(entity.tags).toEqual(new Set(['someTag1']));
  });

  it('can be observed for added changes', () =>
    new Promise<void>((done) => {
      const entity = new ex.Entity();
      const typeA = new FakeComponentA();
      entity.componentAdded$.register({
        notify: (change) => {
          expect(change.owner).toBe(entity);
          expect(change).toBe(typeA);
          done();
        }
      });
      entity.addComponent(typeA);
    }));

  it('can be observed for removed changes', () =>
    new Promise<void>((done) => {
      const entity = new ex.Entity();
      const typeA = new FakeComponentA();

      entity.addComponent(typeA);
      entity.componentRemoved$.register({
        notify: (change) => {
          expect(change.owner).toBe(entity);
          expect(change).toBe(typeA);
          done();
        }
      });
      entity.removeComponent(FakeComponentA);
      entity.processComponentRemoval();
    }));

  it('can be cloned', () => {
    const entity = new ex.Entity();
    const typeA = new FakeComponentA();
    const typeB = new FakeComponentB();
    entity.addComponent(typeA);
    entity.addComponent(typeB);
    entity.addChild(new ex.Entity([new FakeComponentZ()]));

    const clone = entity.clone();
    expect(clone).not.toBe(entity);
    expect(clone.id).not.toBe(entity.id);
    expect(clone.get(FakeComponentA)).not.toBe(entity.get(FakeComponentA));
    expect(clone.get(FakeComponentB)).not.toBe(entity.get(FakeComponentB));
    expect(clone.get(FakeComponentA).constructor).toBe(entity.get(FakeComponentA).constructor);
    expect(clone.get(FakeComponentB).constructor).toBe(entity.get(FakeComponentB).constructor);
    expect(clone.children.length).toBe(1);
    expect(clone.children[0].types).toEqual([FakeComponentZ]);
  });

  it('can be initialized with a template', () => {
    const entity = new ex.Entity();
    const template = new ex.Entity([new FakeComponentA(), new FakeComponentB()]).addChild(
      new ex.Entity([new FakeComponentC(), new FakeComponentD()]).addChild(new ex.Entity([new FakeComponentZ()]))
    );

    expect(entity.getComponents()).toEqual([]);
    entity.addTemplate(template);
    expect(entity.types.sort((a, b) => a.name.localeCompare(b.name))).toEqual([FakeComponentA, FakeComponentB]);
    expect(entity.children[0].types.sort((a, b) => a.name.localeCompare(b.name))).toEqual([FakeComponentC, FakeComponentD]);
    expect(entity.children[0].children[0].types).toEqual([FakeComponentZ]);
  });

  it('can be checked if it has a component', () => {
    const entity = new ex.Entity();
    const typeA = new FakeComponentA();
    const typeB = new FakeComponentB();
    entity.addComponent(typeA);
    entity.addComponent(typeB);

    expect(entity.has(FakeComponentA)).toBe(true);
    expect(entity.has(FakeComponentB)).toBe(true);
    expect(entity.has(FakeComponentC)).toBe(false);
  });

  it('has an overridable initialize lifecycle handler', () =>
    new Promise<void>((done) => {
      const entity = new ex.Entity();
      entity.onInitialize = () => {
        done();
      };

      entity._initialize(null);
    }));

  it('has an event initialize handler', () =>
    new Promise<void>((done) => {
      const entity = new ex.Entity();
      entity.on('initialize', () => {
        done();
      });

      entity._initialize(null);
    }));

  it('has an overridable preupdate lifecycle handler', () =>
    new Promise<void>((done) => {
      const entity = new ex.Entity();
      entity.onPreUpdate = () => {
        done();
      };

      entity._preupdate(null, 1);
    }));

  it('has an event preupdate handler', () =>
    new Promise<void>((done) => {
      const entity = new ex.Entity();
      entity.on('preupdate', () => {
        done();
      });

      entity._preupdate(null, 1);
    }));

  it('has an overridable postupdate lifecycle handler', () =>
    new Promise<void>((done) => {
      const entity = new ex.Entity();
      entity.onPostUpdate = () => {
        done();
      };

      entity._postupdate(null, 1);
    }));

  it('has an event postupdate handler', () =>
    new Promise<void>((done) => {
      const entity = new ex.Entity();
      entity.on('postupdate', () => {
        done();
      });

      entity._postupdate(null, 1);
    }));

  it('can be parented', () => {
    const parent = new ex.Entity();
    const child = new ex.Entity();
    parent.addChild(child);

    expect(child.parent).toBe(parent);
    expect(parent.children).toEqual([child]);
    expect(parent.parent).toBe(null);
  });

  it('can be grandparented', () => {
    const parent = new ex.Entity();
    const child = new ex.Entity();
    const grandchild = new ex.Entity();
    parent.addChild(child.addChild(grandchild));

    expect(grandchild.parent).toBe(child);
    expect(child.parent).toBe(parent);
    expect(parent.children).toEqual([child]);

    expect(grandchild.getAncestors()).toEqual([parent, child, grandchild]);
    expect(parent.getDescendants()).toEqual([parent, child, grandchild]);
  });

  it('can be unparented', () => {
    const parent = new ex.Entity();
    const child = new ex.Entity();
    const grandchild = new ex.Entity();
    parent.addChild(child.addChild(grandchild));

    expect(child.parent).toBe(parent);

    child.unparent();

    expect(child.parent).toBe(null);
  });

  it("can't have a cycle", () => {
    const parent = new ex.Entity();
    const child = new ex.Entity();

    parent.addChild(child);

    expect(() => {
      child.addChild(parent);
    }).toThrowError('Cycle detected, cannot add entity');
  });

  it("can't parent if already parented", () => {
    const parent = new ex.Entity();
    const child = new ex.Entity();
    const otherParent = new ex.Entity();

    parent.addChild(child);
    expect(() => {
      otherParent.addChild(child);
    }).toThrowError('Entity already has a parent, cannot add without unparenting');
  });

  it('can observe components added', () => {
    const e = new ex.Entity();
    const addedSpy = vi.fn();
    e.componentAdded$.register({
      notify: addedSpy
    });
    const component = new FakeComponentA();
    e.addComponent(component);
    expect(addedSpy).toHaveBeenCalledTimes(1);
  });

  it('can observe components removed', () => {
    const e = new ex.Entity();
    const removedSpy = vi.fn();
    e.componentRemoved$.register({
      notify: removedSpy
    });
    const component = new FakeComponentA();
    e.addComponent(component);
    e.removeComponent(FakeComponentA);
    e.processComponentRemoval();
    expect(removedSpy).toHaveBeenCalledTimes(1);
  });

  it('will have onAdd & onRemove called when removed', async () => {
    const engine = TestUtils.engine({ width: 100, height: 100 });
    await TestUtils.runToReady(engine);

    const e = new ex.Entity();

    const onAddSpy = vi.fn();
    e.onAdd = onAddSpy;

    const onRemoveSpy = vi.fn();
    e.onRemove = onRemoveSpy;

    const scene = new ex.Scene();
    scene.add(e);

    engine.addScene('test', scene);
    await engine.goToScene('test');
    engine.screen.setCurrentCamera(engine.currentScene.camera);

    class TestSystem extends ex.System {
      systemType = ex.SystemType.Update;
      update(elapsed: number): void {
        e.kill();
      }
    }

    scene.world.systemManager.addSystem(TestSystem);

    scene.update(engine, 100);

    expect(onAddSpy).toHaveBeenCalledOnce();
    expect(onRemoveSpy).toHaveBeenCalledOnce();
  });

  it('can add and remove children in the ECS world', () => {
    const e = new ex.Entity();
    const child = new ex.Entity();
    const grandchild = new ex.Entity();
    e.addChild(child.addChild(grandchild));

    const world = new ex.World(new ex.Scene());

    world.add(e);

    expect(world.entityManager.entities.length).toBe(3);

    grandchild.addChild(new ex.Entity());

    expect(world.entityManager.entities.length).toBe(4);

    child.removeChild(grandchild);

    expect(world.entityManager.entities.length).toBe(2);
  });

  it('will inherit scene from a parent entity', () => {
    const e = new ex.Entity([], 'e');
    const child = new ex.Entity([], 'child');
    const grandchild = new ex.Entity([], 'grandchild');

    const scene = new ex.Scene();
    e.addChild(child.addChild(grandchild));
    scene.add(e);
    expect(e.scene).toBe(scene);
    expect(child.scene).toBe(scene);
    expect(grandchild.scene).toBe(scene);

    e.removeChild(child);
    expect(e.scene).toBe(scene);
    expect(child.scene).toBe(null);
    expect(child.parent).toBe(null);
    expect(grandchild.scene).toBe(null);
    expect(grandchild.parent).toBe(child);

    e.addChild(child);
    expect(e.scene).toBe(scene);
    expect(child.scene).toBe(scene);
    expect(grandchild.scene).toBe(scene);

    // deferred removal
    scene.remove(e);
    expect(e.scene).not.toBe(null);
    expect(child.scene).not.toBe(null);
    expect(grandchild.scene).not.toBe(null);

    scene.world.entityManager.processEntityRemovals();
    expect(e.scene).toBe(null);
    expect(child.scene).toBe(null);
    expect(grandchild.scene).toBe(null);
  });

  it('will inherit the scene from the parent entity after being added', () => {
    const parent = new ex.Entity([], 'parent');
    const child = new ex.Entity([], 'child');

    const scene = new ex.Scene();

    scene.add(parent);

    expect(parent.scene).toBe(scene);

    parent.addChild(child);

    expect(child.scene).toBe(scene);
  });

  it('can removeAllChildren correctly', () => {
    const e = new ex.Entity();
    const child1 = new ex.Entity();
    const child2 = new ex.Entity();
    const child3 = new ex.Entity();
    const child4 = new ex.Entity();
    const child5 = new ex.Entity();
    const child6 = new ex.Entity();
    e.addChild(child1);
    e.addChild(child2);
    e.addChild(child3);
    e.addChild(child4);
    e.addChild(child5);
    e.addChild(child6);

    expect(e.children.length).toBe(6);

    e.removeAllChildren();

    expect(e.children.length).toBe(0);
  });

  it('will remove children from the parent when a child is killed', () => {
    const e = new ex.Entity();
    const child1 = new ex.Entity();
    const child2 = new ex.Entity();
    const child3 = new ex.Entity();
    const child4 = new ex.Entity();
    const child5 = new ex.Entity();
    const child6 = new ex.Entity();
    const grandChild = new ex.Entity();
    e.addChild(child1);
    e.addChild(child2);
    e.addChild(child3);
    e.addChild(child4);
    e.addChild(child5);
    e.addChild(child6);
    child6.addChild(grandChild);

    expect(e.children.length).toBe(6);

    child1.kill();
    child2.kill();
    child3.kill();
    child4.kill();
    child5.kill();
    child6.kill();

    expect(e.children.length).toBe(0);
    expect(child6.children.length).toBe(1);
    expect(grandChild.parent).toBe(child6);
  });

  it('will remove children from the parent when a child is removed', () => {
    const e = new ex.Entity();
    const child1 = new ex.Entity();
    const child2 = new ex.Entity();
    const child3 = new ex.Entity();
    const child4 = new ex.Entity();
    const child5 = new ex.Entity();
    const child6 = new ex.Entity();
    const grandChild = new ex.Entity();
    e.addChild(child1);
    e.addChild(child2);
    e.addChild(child3);
    e.addChild(child4);
    e.addChild(child5);
    e.addChild(child6);
    child6.addChild(grandChild);

    expect(e.children.length).toBe(6);

    e.removeChild(child1);
    e.removeChild(child2);
    e.removeChild(child3);
    e.removeChild(child4);
    e.removeChild(child5);
    e.removeChild(child6);

    expect(e.children.length).toBe(0);
    expect(child6.children.length).toBe(1);
    expect(grandChild.parent).toBe(child6);
  });

  it('will return subclass instances of types', () => {
    class MyBody extends ex.BodyComponent {}
    const body = new MyBody();
    const sut = new ex.Entity([body]);

    expect(sut.get(MyBody)).toBe(body);
    expect(sut.get(ex.BodyComponent)).toBe(body);

    sut.removeComponent(body, true);

    const superBody = new ex.BodyComponent();
    sut.addComponent(superBody);
    expect(sut.get(MyBody)).toBe(undefined);
    expect(sut.get(ex.BodyComponent)).toBe(superBody);
  });

  it('can detect children', () => {
    const e = new ex.Entity();
    const child1 = new ex.Entity();
    const child2 = new ex.Entity();
    const notChild = new ex.Entity();

    e.addChild(child1);
    child1.addChild(child2);

    expect(e.hasChild(child1, true)).toBe(true);
    expect(e.hasChild(child1, false)).toBe(true);
    expect(e.hasChild(child2, false)).toBe(false);
    expect(e.hasChild(child2, true)).toBe(true);
    expect(child1.hasChild(child2)).toBe(true);
    expect(e.hasChild(notChild)).toBe(false);
  });
});
