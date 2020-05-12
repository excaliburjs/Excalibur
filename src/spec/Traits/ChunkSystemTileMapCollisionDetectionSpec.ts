import * as ex from '@excalibur';
import { TestUtils } from '../util/TestUtils';

describe('ChunkSystemTileMapCollisionDetection', () => {
  type SimpleCellGenerator = (cell: ex.Cell, chunk: ex.TileMap, chunkSystem: ex.ChunkSystemTileMap, engine: ex.Engine) => ex.Cell;

  const trait = new ex.Traits.ChunkSystemTileMapCollisionDetection();
  const actor = new ex.Actor({
    width: 32,
    height: 32
  } as ex.ActorArgs);
  const engine = TestUtils.engine();
  let chunkSystem: ex.ChunkSystemTileMap;
  let currentCellGenerator: (cell: ex.Cell) => void;

  beforeAll(() => {
    engine.add(actor);
  });

  beforeEach(() => {
    for (const previousChunkSytem of engine.currentScene.chunkSystems) {
      engine.currentScene.remove(previousChunkSytem);
    }

    chunkSystem = new ex.ChunkSystemTileMap({
      x: -64,
      y: -64,
      cellWidth: 8,
      cellHeight: 8,
      chunkSize: 16,
      cols: 16,
      rows: 16,
      chunkGarbageCollectorPredicate: () => false,
      chunkRenderingCachePredicate: () => false,
      chunkGenerator: ex.wrapCellGenerator((cell) => currentCellGenerator(cell))
    });
    actor.pos = ex.vec(0, 0);
    actor.body.collider.type = ex.CollisionType.PreventCollision;
    engine.add(chunkSystem);
  });

  describe('update', () => {
    it('has no effect if the colliding actor has the PreventCollision collider', () => {
      currentCellGenerator = (cell) => (cell.solid = true);
      chunkSystem.update(engine, 16);
      spyOn(chunkSystem, 'collides').and.callThrough();
      trait.update(actor, engine);
      expect(chunkSystem.collides).not.toHaveBeenCalled();
      expect(actor.pos.x).toBe(0);
      expect(actor.pos.y).toBe(0);
    });

    it('fires a precollision event for an actor with the Passive collider', () => {
      currentCellGenerator = (cell) => (cell.solid = !cell.x && !cell.y);
      actor.body.collider.type = ex.CollisionType.Passive;
      const eventHandler = jasmine.createSpy();
      const postCollisionHandler = jasmine.createSpy();
      actor.eventDispatcher.on('precollision', eventHandler);
      actor.eventDispatcher.on('postcollision', postCollisionHandler);
      chunkSystem.update(engine, 16);
      spyOn(chunkSystem, 'collides').and.callThrough();
      trait.update(actor, engine);
      expect(chunkSystem.collides).toHaveBeenCalledTimes(4);
      expect(actor.pos.x).toBe(0);
      expect(actor.pos.y).toBe(0);
      expect(eventHandler).toHaveBeenCalledTimes(3);
      for (let callIndex = 0; callIndex < 3; callIndex++) {
        const callArgs = eventHandler.calls.argsFor(callIndex);
        expect(callArgs.length).toBe(1);
        expect(callArgs[0] instanceof ex.PreCollisionEvent).toBe(true);
        const event = callArgs[0] as ex.PreCollisionEvent;
        expect(event.actor).toBe(actor);
        expect(event.other).toBeNull();
        expect(event.target).toBe(actor);
        expect(event.side).toBe(ex.Side.Bottom);
        expect(event.intersection).toEqual(ex.vec(0, -16));
      }
      expect(postCollisionHandler).not.toHaveBeenCalled();
    });

    it('fires a precollision event for an actor with the Fixed collider', () => {
      currentCellGenerator = (cell) => (cell.solid = !cell.x && !cell.y);
      actor.body.collider.type = ex.CollisionType.Fixed;
      const eventHandler = jasmine.createSpy();
      const postCollisionHandler = jasmine.createSpy();
      actor.eventDispatcher.on('precollision', eventHandler);
      actor.eventDispatcher.on('postcollision', postCollisionHandler);
      chunkSystem.update(engine, 16);
      spyOn(chunkSystem, 'collides').and.callThrough();
      trait.update(actor, engine);
      expect(chunkSystem.collides).toHaveBeenCalledTimes(4);
      expect(actor.pos.x).toBe(0);
      expect(actor.pos.y).toBe(0);
      expect(eventHandler).toHaveBeenCalledTimes(3);
      for (let callIndex = 0; callIndex < 3; callIndex++) {
        const callArgs = eventHandler.calls.argsFor(callIndex);
        expect(callArgs.length).toBe(1);
        expect(callArgs[0] instanceof ex.PreCollisionEvent).toBe(true);
        const event = callArgs[0] as ex.PreCollisionEvent;
        expect(event.actor).toBe(actor);
        expect(event.other).toBeNull();
        expect(event.target).toBe(actor);
        expect(event.side).toBe(ex.Side.Bottom);
        expect(event.intersection).toEqual(ex.vec(0, -16));
      }
      expect(postCollisionHandler).not.toHaveBeenCalled();
    });

    it('fires a precollision and postcollision event for an actor with the Active collider', () => {
      currentCellGenerator = (cell) => (cell.solid = !cell.x && !cell.y);
      actor.body.collider.type = ex.CollisionType.Active;
      const preCollisionHandler = jasmine
        .createSpy('preCollisionHandler', (event) => {
          expect(actor.pos.x).toBe(0);
          expect(actor.pos.y).toBe(0);
        })
        .and.callThrough();
      const postCollisionHandler = jasmine
        .createSpy('postCollisionHandler', (event) => {
          expect(actor.pos.x).toBe(0);
          expect(actor.pos.y).toBe(-16);
        })
        .and.callThrough();
      actor.eventDispatcher.on('precollision', preCollisionHandler);
      actor.eventDispatcher.on('postcollision', postCollisionHandler);
      chunkSystem.update(engine, 16);
      spyOn(chunkSystem, 'collides').and.callThrough();
      trait.update(actor, engine);
      expect(chunkSystem.collides).toHaveBeenCalledTimes(2);
      expect(actor.pos.x).toBe(0);
      expect(actor.pos.y).toBe(-16);
      expect(preCollisionHandler).toHaveBeenCalledTimes(1);
      expect(postCollisionHandler).toHaveBeenCalledTimes(1);
      expect(preCollisionHandler.calls.argsFor(0).length).toBe(1);
      expect(postCollisionHandler.calls.argsFor(0).length).toBe(1);
      const preCollisionEvent = preCollisionHandler.calls.argsFor(0)[0] as ex.PreCollisionEvent;
      const postCollisionEvent = postCollisionHandler.calls.argsFor(0)[0] as ex.PostCollisionEvent;
      expect(preCollisionEvent instanceof ex.PreCollisionEvent).toBe(true);
      expect(postCollisionEvent instanceof ex.PostCollisionEvent).toBe(true);
      for (const event of [preCollisionEvent, postCollisionEvent]) {
        expect(event.actor).toBe(actor);
        expect(event.other).toBeNull();
        expect(event.target).toBe(actor);
        expect(event.side).toBe(ex.Side.Bottom);
        expect(event.intersection).toEqual(ex.vec(0, -16));
      }
    });
  });
});
