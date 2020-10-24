import * as ex from '@excalibur';

class Dep extends ex.Component<'dep'> {
  public readonly type = 'dep';
}

class ComponentImplementation extends ex.Component<'imp'> {
  public dependencies = [Dep];
  public readonly type = 'imp';
  public otherprop = 'somestring';
  constructor(public clonable: ex.Vector = ex.Vector.Zero) {
    super();
  }

  onAdd = jasmine.createSpy();
  onRemove = jasmine.createSpy();
}

describe('A Component', () => {
  it('exists', () => {
    expect(ex.Component).toBeDefined();
  });

  it('can be created', () => {
    const imp = new ComponentImplementation();

    expect(imp.type).toBe('imp');
    expect(imp.owner).toBe(null);
    expect(imp.onAdd).not.toHaveBeenCalled();
    expect(imp.onRemove).not.toHaveBeenCalled();
  });

  it('can be created and added or removed from an entity', () => {
    const entity = new ex.Entity();
    const imp = new ComponentImplementation();
    entity.addComponent(imp);

    expect(entity.types).toEqual(['dep', 'imp']);
    expect(imp.type).toBe('imp');
    expect(imp.owner).toBe(entity);
    expect(imp.onAdd).toHaveBeenCalledWith(entity);
    expect(imp.onRemove).not.toHaveBeenCalled();

    entity.removeComponent(imp, true);
    expect(imp.owner).toBe(null);
    expect(imp.onRemove).toHaveBeenCalledWith(entity);
  });

  it('can be cloned', () => {
    const imp = new ComponentImplementation();
    const clone = imp.clone();

    expect(imp.otherprop).toEqual(clone.otherprop);
    expect(imp.clonable).not.toBe(clone.clonable);
  });
});
