import * as ex from '@excalibur';
describe('An assert', () => {
  it('exists', () => {
    expect(ex.assert).toBeDefined();
  });

  it('will throw in dev when expression is false', () => {
    const action = () => {
      ex.assert('throws', () => false);
    };

    expect(action).toThrowError('throws');
  });

  it('will not throw in prod when expression is false', () => {
    globalThis.process = {
      env: {
        NODE_ENV: 'production'
      }
    };
    const action = () => {
      ex.assert('throws', () => false);
    };

    expect(action).toThrowError('throws');
    globalThis.process = {
      env: {
        NODE_ENV: 'development'
      }
    };
  });

  it('will not throw in dev when expression is true', () => {
    const action = () => {
      ex.assert('throws', () => true);
    };

    expect(action).not.toThrowError('throws');
  });
});
