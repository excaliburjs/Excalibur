import * as ex from '@excalibur';

describe('Feature Flags', () => {
  beforeEach(() => {
    ex.Flags._reset();
  });
  it('should exist', () => {
    expect(ex.Flags).toBeDefined();
  });

  it('should start empty', () => {
    expect(ex.Flags.show()).toEqual([]);
  });

  it('should list flags that have been set or unset', () => {
    ex.Flags.enable('some-flag-1');
    ex.Flags.disable('some-flag-2');
    ex.Flags.enable('some-flag-3');
    ex.Flags.disable('some-flag-4');
    ex.Flags.enable('some-flag-5');
    expect(ex.Flags.show()).toEqual([
      'some-flag-1',
      'some-flag-2',
      'some-flag-3',
      'some-flag-4',
      'some-flag-5'
    ]);
  });

  it('should let you set flags', () => {
    ex.Flags.enable('some-flag');

    expect(ex.Flags.isEnabled('some-flag')).toBeTrue();
  });

  it('should let you disable flags',( ) => {
    ex.Flags.disable('some-other-flag');

    expect(ex.Flags.isEnabled('some-other-flag')).toBeFalse();
  });

  it('should let you toggle flags', () => {
    ex.Flags.enable('some-cool-flag');
    expect(ex.Flags.isEnabled('some-cool-flag')).toBeTrue();
    ex.Flags.disable('some-cool-flag');
    expect(ex.Flags.isEnabled('some-cool-flag')).toBeFalse();
  });

  it('should return false if the flag is unknown', () => {
    expect(ex.Flags.isEnabled('some-random-flag')).toBeFalse();
  });

  it('should not allow flags to be enabled after being frozen', () => {
    ex.Flags.freeze();

    expect(() => {
      ex.Flags.enable('some-flag');
    }).toThrowError('Feature flags can only be enabled before Engine constructor time');
  });

  it('should not allow flags to be disabled after being frozen', () => {
    ex.Flags.freeze();

    expect(() => {
      ex.Flags.disable('some-flag');
    }).toThrowError('Feature flags can only be disabled before Engine constructor time');
  });

  it('should be frozen after engine construction', () => {
    expect(() => {
      ex.Flags.disable('some-flag');
    }).not.toThrow();

    const engine = new ex.Engine();

    expect(() => {
      ex.Flags.disable('some-flag');
    }).toThrow();
  });

});