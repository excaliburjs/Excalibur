import * as ex from '@excalibur';

class Dep extends ex.Component {}

class ComponentImplementation extends ex.Component {
  public dependencies = [Dep];
  public otherprop = 'somestring';
  constructor(public clonable: ex.Vector = ex.Vector.Zero) {
    super();
  }

  onAdd = vi.fn();
  onRemove = vi.fn();
}

describe('A Component', () => {
  it('exists', () => {
    expect(ex.Component).toBeDefined();
  });

  it('can be created', () => {
    const imp = new ComponentImplementation();

    expect(imp.owner).toBe(undefined);
    expect(imp.onAdd).not.toHaveBeenCalled();
    expect(imp.onRemove).not.toHaveBeenCalled();
  });

  it('can be created and added or removed from an entity', () => {
    const entity = new ex.Entity();
    const imp = new ComponentImplementation();
    entity.addComponent(imp);

    expect(entity.types).toEqual([Dep, ComponentImplementation]);
    expect(imp.owner).toBe(entity);
    expect(imp.onAdd).toHaveBeenCalledWith(entity);
    expect(imp.onRemove).not.toHaveBeenCalled();

    entity.removeComponent(ComponentImplementation, true);
    expect(imp.owner).toBe(undefined);
    expect(imp.onRemove).toHaveBeenCalledWith(entity);
  });

  it('can be cloned', () => {
    const imp = new ComponentImplementation();
    const clone = imp.clone() as ComponentImplementation;

    expect(imp.otherprop).toEqual(clone.otherprop);
    expect(imp.clonable).not.toBe(clone.clonable);
  });
});
