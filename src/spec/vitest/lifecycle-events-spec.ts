import {
  has_initialize,
  has_add,
  has_remove,
  hasOnInitialize,
  has_preupdate,
  hasOnPreUpdate,
  has_postupdate,
  hasOnPostUpdate,
  hasOnAdd,
  hasOnRemove,
  hasPreDraw,
  hasPostDraw
} from '../../engine/interfaces/lifecycle-events';

describe('lifecycle event type guards', () => {
  it('has_initialize detects an object with _initialize', () => {
    expect(has_initialize({ _initialize: vi.fn() })).toBe(true);
    expect(has_initialize({})).toBe(false);
  });

  it('has_add detects an object with onAdd', () => {
    expect(has_add({ onAdd: vi.fn() })).toBe(true);
    expect(has_add({})).toBe(false);
  });

  it('has_remove detects an object with onRemove', () => {
    expect(has_remove({ onRemove: vi.fn() })).toBe(true);
    expect(has_remove({})).toBe(false);
  });

  it('hasOnInitialize detects an object with onInitialize', () => {
    expect(hasOnInitialize({ onInitialize: vi.fn() })).toBe(true);
    expect(hasOnInitialize({})).toBe(false);
  });

  it('has_preupdate detects an object with _preupdate', () => {
    expect(has_preupdate({ _preupdate: vi.fn() })).toBe(true);
    expect(has_preupdate({})).toBe(false);
  });

  it('hasOnPreUpdate detects an object with onPreUpdate', () => {
    expect(hasOnPreUpdate({ onPreUpdate: vi.fn() })).toBe(true);
    expect(hasOnPreUpdate({})).toBe(false);
  });

  it('has_postupdate detects an object with _postupdate', () => {
    expect(has_postupdate({ _postupdate: vi.fn() })).toBe(true);
    expect(has_postupdate({})).toBe(false);
  });

  it('has_postupdate does not match an object that only has onPostUpdate', () => {
    // _postupdate (internal) and onPostUpdate (user-overridable) are distinct hooks,
    // same distinction as has_preupdate/hasOnPreUpdate
    expect(has_postupdate({ onPostUpdate: vi.fn() })).toBe(false);
  });

  it('hasOnPostUpdate detects an object with onPostUpdate', () => {
    expect(hasOnPostUpdate({ onPostUpdate: vi.fn() })).toBe(true);
    expect(hasOnPostUpdate({})).toBe(false);
  });

  it('hasOnAdd detects an object with onAdd', () => {
    expect(hasOnAdd({ onAdd: vi.fn() })).toBe(true);
    expect(hasOnAdd({})).toBe(false);
  });

  it('hasOnRemove detects an object with onRemove', () => {
    expect(hasOnRemove({ onRemove: vi.fn() })).toBe(true);
    expect(hasOnRemove({})).toBe(false);
  });

  it('hasPreDraw detects an object with onPreDraw', () => {
    expect(hasPreDraw({ onPreDraw: vi.fn() })).toBe(true);
    expect(hasPreDraw({})).toBe(false);
  });

  it('hasPostDraw detects an object with onPostDraw', () => {
    expect(hasPostDraw({ onPostDraw: vi.fn() })).toBe(true);
    expect(hasPostDraw({})).toBe(false);
  });
});
