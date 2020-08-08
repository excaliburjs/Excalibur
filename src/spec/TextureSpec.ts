import { ExcaliburMatchers, ensureImagesLoaded } from 'excalibur-jasmine';
import * as ex from '@excalibur';

describe('A Texture', () => {
  beforeEach(() => {
    jasmine.addMatchers(ExcaliburMatchers);
  });

  it('can be loaded from a base64 string', (done) => {
    const base64 = new ex.Texture(
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAD4AAABACAYAAABC6cT1AAAACXBIWXMAAAsSAAALEgHS3X78AAABJElEQVRo3u2aoQ' +
        'rCQByHdyIYBjZNpmXBahHbsNiGxQew7gGMWn2AdYusWeyCGIZpjyAY7NaZ78JtzHDn3fdrx47Bx+8+/jeYqKoq8DGdwNMADjjgbqfrAkSSJI1GU5' +
        '7ngsZdaDiOY+3+oihwHHAcd8jpKIpwnKMOuMWO/+p0WZbSOssyQeOA47g7TqdpKmgccMDNOW7CaRoHHMfddprGAcfx5tmtB5Kz2+Nb2O40jQPuaU' +
        'STf2BUpxfTkfT8cn9K6+F8b53TNA44c7x9VOcfFjpN44Azx9vf1VXH1ahzXr3b0zjggJt1/DDpazd9xj1pvVrOtO87na/GneeoA+6z43VOh2EorT' +
        'e3l9DNeTXMccABt8vxOqdpHHDA3foep3HAAf+bfAH2OXZapkJB/wAAAABJRU5ErkJggg=='
    );

    base64.load().then(() => {
      expect(base64.isLoaded()).toBe(true);
      expect(base64.width).toBe(62);
      expect(base64.height).toBe(64);
    });

    base64.oncomplete = () => {
      done();
    };
  });
});
