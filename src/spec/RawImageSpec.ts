import { ExcaliburMatchers, ensureImagesLoaded } from 'excalibur-jasmine';
import * as ex from '@excalibur';

describe('A RawImage', () => {
  beforeEach(() => {
    jasmine.addMatchers(ExcaliburMatchers);
  });

  it('should exist', () => {
    expect(ex.Graphics.RawImage).toBeDefined();
  });

  it('can be created', () => {
    const image = new ex.Graphics.RawImage('base/src/spec/images/RawImageSpec/sword.png');
    expect(image).toBeTruthy();
  });

  it('has a unique id', () => {
    const image1 = new ex.Graphics.RawImage('base/src/spec/images/RawImageSpec/sword.png');
    const image2 = new ex.Graphics.RawImage('base/src/spec/images/RawImageSpec/sword.png');
    expect(image1.id).not.toEqual(image2.id);
  });

  it('can load an image from a path', (done) => {
    const image = new ex.Graphics.RawImage('base/src/spec/images/RawImageSpec/sword.png');
    image.load().then(() => {
      expect(image.width).toBe(100);
      expect(image.height).toBe(100);
      done();
    });
  });

  it('can load an image from a data url', (done) => {
    const image = new ex.Graphics.RawImage(
      'data:image/png;base64,' +
        'iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAYAAABw4pVUAAACyklEQVR4Xu2coU4D' +
        'QRRFqapocASFqiZoDME1GFQTBF8Ash+AIki+oB6xSRUGjwDRoPoJCAQaCwluRuz2' +
        'dd7bvbs5OOjszJ1z5vWxS8Nojy8pAiOpNITZQ4jYIUAIQsQIiMWhQhAiRkAsDhWC' +
        'EDECYnGoEISIERCLQ4UgRIyAWBwqBCFiBMTiUCEIESMgFocKQYgYAbE4VAhCxAiI' +
        'xaFCECJGQCwOFYIQMQJicaiQTMh8Pv/dxtFqtQphFzLpNhtSHYOQjs3kAmazWW2i' +
        '9Xr9//pyuQw5zCGTdszYtDxCTLjiByMknrFpBYSYcPkPtgqYTqdJiKqq6CGeWhDi' +
        'SdNhLoQ4QPScAiGeNHeYq1TAZrNJVl0sFqG3CqGT78DP/RKEuCMtmxAhZfzcr0aI' +
        'O1LbhH0TkO9ucD0EIbYDHD4aIeGIbQsgxMbLfXTfBQyuhyDE/YyXTYiQMn7uVyPE' +
        'HaltwqEJ6H0PQYjtAIePRkg4YtsCCLHxMo++vz5IPil49/SdPM4ZugC5HoKQVEnn' +
        'DxcRgpDOD2Hd+3rr4fKKuDg9SvK9vH8m3x+eP9T2pfxzU23/DdzcNBsuQIg30cL5' +
        'EFII0PtyhHgTLZxPTki+n4/xbfKjofWMzu9Dmpo6QgpLzHo5QuqJ8ZZlPVHB41sX' +
        'ku/HWjH5fUr+7CuYV/j0CAlHbFsAITZe4aMREo7YtkDrQh5P9mv/U8LP8TjZwdXl' +
        'We2OqufX5PW+9xSE2A5w+GiEhCO2LYAQG6/w0eFCmnrGZDJJNnnz9pVkyu9TciJ9' +
        '7xmtP8tCiK2oqBAbr/DRCAlHbFugdSFNPcMWf3ijESLmFCEIqf81V4xP63HCK6T1' +
        'HfV8QYSICUQIQsQIiMWhQhAiRkAsDhWCEDECYnGoEISIERCLQ4UgRIyAWBwqBCFi' +
        'BMTiUCEIESMgFocKQYgYAbE4VAhCxAiIxaFCxIT8AXYTkHSpdKCLAAAAAElFTkSuQmCC'
    );

    image.load().then(() => {
      expect(image.width).toBe(100);
      expect(image.height).toBe(100);
      done();
    });
  });

  it('will resolve whenLoaded when loaded', (done) => {
    const image = new ex.Graphics.RawImage('base/src/spec/images/RawImageSpec/sword.png');
    image.load();
    image.whenLoaded.then(() => {
      expect(image.width).toBe(100);
      expect(image.height).toBe(100);
      done();
    });
  });
});
