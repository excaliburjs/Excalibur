import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { ComponentData, EntityData, Serializer } from '../../engine/Util/Serializer';
import { Component } from '../../engine/EntityComponentSystem/Component';
import { Actor } from '../../engine/Actor';
import { Entity } from '@excalibur';

class MockComponent extends Component {
  public value: number = 0;

  serialize() {
    return { value: this.value };
  }

  deserialize(data: any) {
    this.value = data.value;
  }
}
class MockComponentWithoutSerialize extends Component {
  public value: number = 0;
}
class CustomActor extends Actor {
  customProperty: string = 'custom';
  constructor() {
    super({
      name: 'CustomActor'
    });
  }
}

describe('The Serializer ', () => {
  beforeEach(() => {
    // Clean up after each test
    Serializer.reset();
  });

  describe('== Initialization ==', () => {
    it('should initialize the serializer', () => {
      expect(Serializer.isInitialized()).toBe(false);
      Serializer.init(true);
      expect(Serializer.isInitialized()).toBe(true);
    });

    it('should warn when initializing twice', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      Serializer.init();
      Serializer.init();
      expect(consoleSpy).toHaveBeenCalledWith('Serializer already initialized. Call reset() before re-initializing.');
      consoleSpy.mockRestore();
    });

    it('should auto-register common components when autoRegisterComponents is true', () => {
      Serializer.init(true);
      expect(Serializer.isInitialized()).toBe(true);
      let a = Serializer.getRegisteredComponents();
      expect(a.length).toBeGreaterThan(0);
    });

    it('should not auto-register components when autoRegisterComponents is false', () => {
      Serializer.init(false);
      let a = Serializer.getRegisteredComponents();
      expect(a.length).toBe(0);
    });

    it('should register built-in serializers on init', () => {
      Serializer.init();

      // Built-in serializers are private, but we can test they work
      const vectorSerializer = Serializer['_customSerializers'].get('Vector');
      expect(vectorSerializer).toBeDefined();

      const colorSerializer = Serializer['_customSerializers'].get('Color');
      expect(colorSerializer).toBeDefined();
    });
  });

  describe('== Component Registration ==', () => {
    beforeEach(() => {
      Serializer.init(false);
    });

    it('should register a component', () => {
      Serializer.registerComponent(MockComponent);
      expect(Serializer.isComponentRegistered('MockComponent')).toBe(true);
    });

    it('should warn when registering duplicate component', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      Serializer.registerComponent(MockComponent);
      Serializer.registerComponent(MockComponent);

      expect(consoleSpy).toHaveBeenCalledWith('Component MockComponent is already registered');

      consoleSpy.mockRestore();
    });

    it('should register multiple components at once', () => {
      Serializer.registerComponents([MockComponent, MockComponentWithoutSerialize]);
      let a = Serializer.getRegisteredComponents();
      expect(a.length).toBe(2);
    });

    it('should get all registered component types', () => {
      Serializer.registerComponents([MockComponent, MockComponentWithoutSerialize]);

      const registered = Serializer.getRegisteredComponents();
      expect(registered).toContain('MockComponent');
      expect(registered).toContain('MockComponentWithoutSerialize');
      expect(registered.length).toBe(2);
    });

    it('should unregister a component', () => {
      Serializer.registerComponent(MockComponent);
      expect(Serializer.isComponentRegistered('MockComponent')).toBe(true);

      const result = Serializer.unregisterComponent('MockComponent');
      expect(result).toBe(true);
      expect(Serializer.isComponentRegistered('MockComponent')).toBe(false);
    });

    it('should return false when unregistering non-existent component', () => {
      Serializer.init(false);
      const result = Serializer.unregisterComponent('NonExistent');
      expect(result).toBe(false);
    });

    it('should clear all components', () => {
      Serializer.registerComponents([MockComponent, MockComponentWithoutSerialize]);
      Serializer.clearComponents();
      expect(Serializer.isComponentRegistered('MockComponent')).toBe(false);
      expect(Serializer.isComponentRegistered('MockComponentWithoutSerialize')).toBe(false);
    });
  });

  describe(' == Actor Registration == ', () => {
    beforeEach(() => {
      Serializer.init(false);
    });

    it('should register a custom actor', () => {
      Serializer.registerCustomActor(CustomActor);
      expect(Serializer.isCustomActorRegistered('CustomActor')).toBe(true);
    });

    it('should warn when registering duplicate custom actor', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      Serializer.registerCustomActor(CustomActor);
      Serializer.registerCustomActor(CustomActor);

      expect(consoleSpy).toHaveBeenCalledWith('Custom Actor CustomActor is already registered');

      consoleSpy.mockRestore();
    });

    it('should get custom actor constructor', () => {
      Serializer.registerCustomActor(CustomActor);
      const ctor = Serializer.getCustomActor('CustomActor');
      expect(ctor).toBe(CustomActor);
    });

    it('should return null for non-existent custom actor', () => {
      const ctor = Serializer.getCustomActor('NonExistent');
      expect(ctor).toBeNull();
    });

    it('should get all registered custom actors', () => {
      Serializer.registerCustomActor(CustomActor);
      const registered = Serializer.getRegisteredCustomActors();
      expect(registered).toContain('CustomActor');
    });

    it('should return empty array when no custom actors registered', () => {
      const registered = Serializer.getRegisteredCustomActors();
      expect(registered).toEqual([]);
    });

    it('should unregister custom actor', () => {
      Serializer.registerCustomActor(CustomActor);
      const result = Serializer.unregisterCustomActor('CustomActor');
      expect(result).toBe(true);
      expect(Serializer.isCustomActorRegistered('CustomActor')).toBe(false);
    });

    it('should clear all custom actors', () => {
      Serializer.registerCustomActor(CustomActor);
      Serializer.clearCustomActors();
      expect(Serializer.isCustomActorRegistered('CustomActor')).toBe(false);
    });
  });

  describe(' == Graphics Registration == ', () => {
    beforeEach(() => {
      Serializer.init(false);
    });

    const mockGraphic = { type: 'sprite', id: 'test-sprite' };

    it('should register a graphic', () => {
      Serializer.registerGraphic('sprite1', mockGraphic);
      expect(Serializer.isGraphicRegistered('sprite1')).toBe(true);
    });

    it('should warn when registering duplicate graphic', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      Serializer.registerGraphic('sprite1', mockGraphic);
      Serializer.registerGraphic('sprite1', mockGraphic);

      expect(consoleSpy).toHaveBeenCalledWith('Graphic sprite1 is already registered');

      consoleSpy.mockRestore();
    });

    it('should get a registered graphic', () => {
      Serializer.registerGraphic('sprite1', mockGraphic);
      const graphic = Serializer.getGraphic('sprite1');
      expect(graphic).toBe(mockGraphic);
    });

    it('should return undefined for non-existent graphic', () => {
      const graphic = Serializer.getGraphic('nonexistent');
      expect(graphic).toBeUndefined();
    });

    it('should register multiple graphics at once', () => {
      const graphics = {
        sprite1: mockGraphic,
        sprite2: { type: 'sprite', id: 'test-sprite-2' }
      };

      Serializer.registerGraphics(graphics);

      expect(Serializer.isGraphicRegistered('sprite1')).toBe(true);
      expect(Serializer.isGraphicRegistered('sprite2')).toBe(true);
    });

    it('should get all registered graphic IDs', () => {
      Serializer.registerGraphic('sprite1', mockGraphic);
      Serializer.registerGraphic('sprite2', mockGraphic);

      const ids = Serializer.getRegisteredGraphics();
      expect(ids).toContain('sprite1');
      expect(ids).toContain('sprite2');
    });

    it('should unregister a graphic', () => {
      Serializer.registerGraphic('sprite1', mockGraphic);
      const result = Serializer.unregisterGraphic('sprite1');
      expect(result).toBe(true);
      expect(Serializer.isGraphicRegistered('sprite1')).toBe(false);
    });

    it('should clear all graphics', () => {
      Serializer.registerGraphic('sprite1', mockGraphic);
      Serializer.clearGraphics();
      expect(Serializer.isGraphicRegistered('sprite1')).toBe(false);
    });
  });

  describe(' == Component Serialization == ', () => {
    beforeEach(() => {
      Serializer.init(false);
      Serializer.registerComponent(MockComponent);
    });

    it('should serialize a component', () => {
      const component = new MockComponent();
      component.value = 42;

      const data = Serializer.serializeComponent(component);

      expect(data).not.toBeNull();
      expect(data?.type).toBe('MockComponent');
      expect(data?.value).toBe(42);
    });

    it('should deserialize a component', () => {
      const data: ComponentData = {
        type: 'MockComponent',
        value: 42
      };

      const component = Serializer.deserializeComponent(data);

      expect(component).not.toBeNull();
      expect(component).toBeInstanceOf(MockComponent);
      expect((component as MockComponent).value).toBe(42);
    });

    it('should return null when deserializing unregistered component', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      const data: ComponentData = {
        type: 'UnknownComponent',
        value: 42
      };

      const component = Serializer.deserializeComponent(data);

      expect(component).toBeNull();
      expect(consoleSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });

    it('should handle component data without type field', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const data = { value: 42 } as ComponentData;
      const component = Serializer.deserializeComponent(data);

      expect(component).toBeNull();
      expect(consoleSpy).toHaveBeenCalledWith('Component data missing type field');

      consoleSpy.mockRestore();
    });
  });

  describe(' == Entity Serialization == ', () => {
    beforeEach(() => {
      Serializer.init(false);
      Serializer.registerComponent(MockComponent);
    });

    it('should serialize an entity', () => {
      const entity = new Entity();
      entity.name = 'TestEntity';

      const component = new MockComponent();
      component.value = 100;
      entity.addComponent(component);

      const data = Serializer.serializeEntity(entity);

      expect(data.type).toBe('Entity');
      expect(data.name).toBe('TestEntity');
      expect(data.components.length).toBe(1);
      expect(data.components[0].type).toBe('MockComponent');
      expect(data.components[0].value).toBe(100);
    });

    it('should serialize entity with tags', () => {
      const entity = new Entity();
      entity.addTag('player');
      entity.addTag('hero');

      const data = Serializer.serializeEntity(entity);

      expect(data.tags).toContain('player');
      expect(data.tags).toContain('hero');
    });

    it('should serialize entity with children', () => {
      const parent = new Entity();
      parent.name = 'Parent';

      const child = new Entity();
      child.name = 'Child';
      parent.addChild(child);

      const data = Serializer.serializeEntity(parent);

      expect(data.children.length).toBe(1);
      expect(data.children[0].name).toBe('Child');
    });

    it('should deserialize an entity', () => {
      const data: EntityData = {
        type: 'Entity',
        name: 'TestEntity',
        tags: ['player'],
        components: [{ type: 'MockComponent', value: 100 }],
        children: []
      };

      const entity = Serializer.deserializeEntity(data);

      expect(entity).not.toBeNull();
      expect(entity?.name).toBe('TestEntity');
      expect(entity?.getComponents().length).toBe(1);
      expect((entity?.get(MockComponent) as MockComponent)?.value).toBe(100);
    });

    it('should deserialize entity with children', () => {
      const data: EntityData = {
        type: 'Entity',
        name: 'Parent',
        tags: [],
        components: [],
        children: [
          {
            type: 'Entity',
            name: 'Child',
            tags: [],
            components: [],
            children: []
          }
        ]
      };

      const entity = Serializer.deserializeEntity(data);

      expect(entity?.children.length).toBe(1);
      expect(entity?.children[0].name).toBe('Child');
    });
  });

  describe(' == Actor Serialization == ', () => {
    beforeEach(() => {
      Serializer.init(false);
      Serializer.registerComponent(MockComponent);
    });

    it('should serialize an actor', () => {
      const actor = new Actor();
      actor.name = 'TestActor';

      const data = Serializer.serializeActor(actor);

      expect(data.type).toBe('Actor');
      expect(data.name).toBe('TestActor');
    });

    it('should serialize custom actor with customInstance field', () => {
      Serializer.registerCustomActor(CustomActor);

      const actor = new CustomActor();
      actor.name = 'CustomTestActor';

      const data = Serializer.serializeActor(actor);

      expect(data.customInstance).toBe('CustomActor');
    });

    it('should deserialize an actor', () => {
      const data: EntityData = {
        type: 'Actor',
        name: 'TestActor',
        tags: [],
        components: [],
        children: []
      };

      const actor = Serializer.deserializeActor(data);

      expect(actor).not.toBeNull();
      expect(actor).toBeInstanceOf(Actor);
      expect(actor?.name).toBe('TestActor');
    });

    it('should deserialize custom actor', () => {
      Serializer.registerCustomActor(CustomActor);

      const data: EntityData = {
        type: 'Actor',
        name: 'CustomTestActor',
        tags: [],
        components: [],
        children: [],
        customInstance: 'CustomActor'
      };

      const actor = Serializer.deserializeActor(data);

      expect(actor).toBeInstanceOf(CustomActor);
      expect((actor as CustomActor).customProperty).toBe('custom');
    });
  });

  describe(' == JSON Conversions == ', () => {
    beforeEach(() => {
      Serializer.init(false);
      Serializer.registerComponent(MockComponent);
    });

    it('should convert entity to JSON string', () => {
      const entity = new Entity();
      entity.name = 'TestEntity';

      const json = Serializer.entityToJSON(entity);
      const parsed = JSON.parse(json);

      expect(parsed.name).toBe('TestEntity');
      expect(parsed.type).toBe('Entity');
    });

    it('should convert entity to pretty JSON', () => {
      const entity = new Entity();
      entity.name = 'TestEntity';

      const json = Serializer.entityToJSON(entity, true);

      expect(json).toContain('\n');
      expect(json).toContain('  ');
    });

    it('should convert entity from JSON string', () => {
      const json = JSON.stringify({
        type: 'Entity',
        name: 'TestEntity',
        tags: [],
        components: [],
        children: []
      });

      const entity = Serializer.entityFromJSON(json);

      expect(entity).not.toBeNull();
      expect(entity?.name).toBe('TestEntity');
    });

    it('should handle invalid JSON when deserializing entity', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const entity = Serializer.entityFromJSON('invalid json');

      expect(entity).toBeNull();
      expect(consoleSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });

    it('should convert actor to JSON string', () => {
      const actor = new Actor();
      actor.name = 'TestActor';

      const json = Serializer.actorToJSON(actor);
      const parsed = JSON.parse(json);

      expect(parsed.name).toBe('TestActor');
      expect(parsed.type).toBe('Actor');
    });

    it('should convert actor from JSON string', () => {
      const json = JSON.stringify({
        type: 'Actor',
        name: 'TestActor',
        tags: [],
        components: [],
        children: []
      });

      const actor = Serializer.actorFromJSON(json);

      expect(actor).not.toBeNull();
      expect(actor?.name).toBe('TestActor');
    });
  });

  describe(' == Data Validations == ', () => {
    it('should validate correct entity data', () => {
      const data: EntityData = {
        type: 'Entity',
        name: 'Test',
        tags: [],
        components: [{ type: 'MockComponent' }],
        children: []
      };

      expect(Serializer.validateEntityData(data)).toBe(true);
    });

    it('should reject null data', () => {
      expect(Serializer.validateEntityData(null)).toBe(false);
    });

    it('should reject data with wrong type', () => {
      const data = {
        type: 'NotEntity',
        name: 'Test',
        tags: [],
        components: [],
        children: []
      };

      expect(Serializer.validateEntityData(data)).toBe(false);
    });

    it('should reject data without name', () => {
      const data = {
        type: 'Entity',
        tags: [],
        components: [],
        children: []
      };

      expect(Serializer.validateEntityData(data)).toBe(false);
    });

    it('should reject data with invalid components array', () => {
      const data = {
        type: 'Entity',
        name: 'Test',
        tags: [],
        components: 'not an array',
        children: []
      };

      expect(Serializer.validateEntityData(data)).toBe(false);
    });

    it('should reject data with component missing type', () => {
      const data = {
        type: 'Entity',
        name: 'Test',
        tags: [],
        components: [{ value: 42 }],
        children: []
      };

      expect(Serializer.validateEntityData(data)).toBe(false);
    });
  });

  describe(' == Custom Serializers == ', () => {
    beforeEach(() => {
      Serializer.init(false);
    });
    it('should register custom serializer', () => {
      const serialize = (obj: any) => ({ data: obj.value });
      const deserialize = (data: any) => ({ value: data.data });

      Serializer.registerCustomSerializer('CustomType', serialize, deserialize);

      const serializer = Serializer['_customSerializers'].get('CustomType');
      expect(serializer).toBeDefined();
    });

    it('should use built-in Vector serializer', () => {
      const vectorSerializer = Serializer['_customSerializers'].get('Vector');
      expect(vectorSerializer).toBeDefined();

      const serialized = vectorSerializer!.serialize({ x: 10, y: 20 });
      expect(serialized).toEqual({ x: 10, y: 20 });

      const deserialized = vectorSerializer!.deserialize({ x: 10, y: 20 });
      expect(deserialized).toEqual({ x: 10, y: 20 });
    });

    it('should use built-in Color serializer', () => {
      const colorSerializer = Serializer['_customSerializers'].get('Color');
      expect(colorSerializer).toBeDefined();

      const serialized = colorSerializer!.serialize({ r: 255, g: 128, b: 64, a: 1 });
      expect(serialized).toEqual({ r: 255, g: 128, b: 64, a: 1 });
    });
  });

  describe(' == Resetting Featuer == ', () => {
    it('should reset all registries', () => {
      Serializer.init(false);
      Serializer.registerComponent(MockComponent);
      Serializer.registerGraphic('sprite1', {});
      Serializer.registerCustomActor(CustomActor);

      Serializer.reset();

      expect(Serializer['_initialized']).toBe(false);
      expect(Serializer['_componentRegistry'].size).toBe(0);
      expect(Serializer['_graphicsRegistry'].size).toBe(0);
      expect(Serializer['_actorRegistry'].size).toBe(0);
      expect(Serializer['_customSerializers'].size).toBe(0);
    });
  });
});
