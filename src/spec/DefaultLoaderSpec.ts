import * as ex from '@excalibur';
import { TestUtils } from './util/TestUtils';

fdescribe('A DefaultLoader', () => {

  it('exists', () => {
    expect(ex.DefaultLoader).toBeDefined();
  });

  it('can be constructor', () => {
    const sut = new ex.DefaultLoader();
  });
});