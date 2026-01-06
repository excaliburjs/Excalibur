import { describe, it, expect, beforeEach, vi } from 'vitest';
import { PauseSystem } from '../../engine/util/pause-system';
import { PauseComponent } from '../../engine/entity-component-system/components/pause-component';
import type { Scene } from '../../engine/scene';
import { Entity } from '../../engine/entity-component-system/entity';
import { Engine } from '../../engine/engine';

describe('PauseSystem', () => {
  let pauseSystem: PauseSystem;
  let engine: Engine;
  let scene: Scene;

  beforeEach(async () => {
    // Create a minimal engine instance for testing
    engine = new Engine({
      width: 800,
      height: 600
    });
    scene = engine.currentScene;
    pauseSystem = scene.world.get(PauseSystem);
  });

  it('should initialize with isPaused set to false', () => {
    expect(pauseSystem.isPaused).toBe(false);
  });

  it('should set isPaused to true when scene emits pause event', () => {
    scene.pauseScene();
    expect(pauseSystem.isPaused).toBe(true);
  });

  it('should set isPaused to false when scene emits resume event', () => {
    scene.pauseScene();
    expect(pauseSystem.isPaused).toBe(true);

    scene.resumeScene();
    expect(pauseSystem.isPaused).toBe(false);
  });

  it('should update PauseComponent.paused for entities with canPause=true', () => {
    const entity = new Entity();
    const pauseComponent = new PauseComponent({ canPause: true });
    entity.addComponent(pauseComponent);
    scene.add(entity);

    expect(pauseComponent.paused).toBe(false);

    scene.pauseScene();
    pauseSystem.update(16);

    expect(pauseComponent.paused).toBe(true);
  });

  it('should not update PauseComponent.paused for entities with canPause=false', () => {
    const entity = new Entity();
    const pauseComponent = new PauseComponent({ canPause: false });
    entity.addComponent(pauseComponent);
    scene.add(entity);

    expect(pauseComponent.paused).toBe(false);

    scene.pauseScene();
    pauseSystem.update(16);

    expect(pauseComponent.paused).toBe(false);
  });

  it('should handle multiple entities with different canPause settings', () => {
    const pausableEntity = new Entity();
    const pausableComponent = new PauseComponent({ canPause: true });
    pausableEntity.addComponent(pausableComponent);
    scene.add(pausableEntity);

    const nonPausableEntity = new Entity();
    const nonPausableComponent = new PauseComponent({ canPause: false });
    nonPausableEntity.addComponent(nonPausableComponent);
    scene.add(nonPausableEntity);

    scene.pauseScene();
    pauseSystem.update(16);

    expect(pausableComponent.paused).toBe(true);
    expect(nonPausableComponent.paused).toBe(false);
  });

  it('should resume all pausable entities when scene resumes', () => {
    const entity1 = new Entity();
    const component1 = new PauseComponent({ canPause: true });
    entity1.addComponent(component1);
    scene.add(entity1);

    const entity2 = new Entity();
    const component2 = new PauseComponent({ canPause: true });
    entity2.addComponent(component2);
    scene.add(entity2);

    // Pause
    scene.pauseScene();
    pauseSystem.update(16);
    expect(component1.paused).toBe(true);
    expect(component2.paused).toBe(true);

    // Resume
    scene.resumeScene();
    pauseSystem.update(16);
    expect(component1.paused).toBe(false);
    expect(component2.paused).toBe(false);
  });

  it('should toggle pause state multiple times', () => {
    const entity = new Entity();
    const pauseComponent = new PauseComponent({ canPause: true });
    entity.addComponent(pauseComponent);
    scene.add(entity);

    // First pause
    scene.pauseScene();
    pauseSystem.update(16);
    expect(pauseComponent.paused).toBe(true);

    // Resume
    scene.resumeScene();
    pauseSystem.update(16);
    expect(pauseComponent.paused).toBe(false);

    // Pause again
    scene.pauseScene();
    pauseSystem.update(16);
    expect(pauseComponent.paused).toBe(true);

    // Resume again
    scene.resumeScene();
    pauseSystem.update(16);
    expect(pauseComponent.paused).toBe(false);
  });

  it('should not affect entities without PauseComponent', () => {
    const entityWithoutPause = new Entity();
    scene.add(entityWithoutPause);

    expect(() => {
      scene.pauseScene();
      pauseSystem.update(16);
    }).not.toThrow();
  });

  it('should handle dynamically changing canPause property', () => {
    const entity = new Entity();
    const pauseComponent = new PauseComponent({ canPause: true });
    entity.addComponent(pauseComponent);
    scene.add(entity);

    // Initially pausable
    scene.pauseScene();
    pauseSystem.update(16);
    expect(pauseComponent.paused).toBe(true);

    // Make it non-pausable while paused
    pauseComponent.canPause = false;
    scene.resumeScene();
    pauseSystem.update(16);

    // Try to pause again - should not affect it
    scene.pauseScene();
    pauseSystem.update(16);
    expect(pauseComponent.paused).toBe(false);
  });
});
