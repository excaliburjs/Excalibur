import * as ex from '@excalibur';
import { ImageRenderer } from '../engine/Graphics/Context/image-renderer/image-renderer';

describe('A ImageSource', () => {
  it('exists', () => {
    expect(ex.ImageSource).toBeDefined();
  });

  it('can be constructed', () => {
    const spriteFontImage = new ex.ImageSource('src/spec/images/GraphicsTextSpec/spritefont.png');
    expect(spriteFontImage).toBeDefined();
  });

  it('logs a warning on image type not supported', () => {
    const logger = ex.Logger.getInstance();
    spyOn(logger, 'warn');
    const image1 = new ex.ImageSource('base/404/img.svg');
    expect(logger.warn).toHaveBeenCalledTimes(0);
    const image2 = new ex.ImageSource('base/404/img.gif');
    expect(logger.warn).toHaveBeenCalledTimes(1);
  });

  it('can load images', async () => {
    const spriteFontImage = new ex.ImageSource('src/spec/images/GraphicsTextSpec/spritefont.png');
    const whenLoaded = jasmine.createSpy('whenLoaded');
    const image = await spriteFontImage.load();
    await spriteFontImage.ready.then(whenLoaded);

    expect(image.src).not.toBeNull();
    expect(whenLoaded).toHaveBeenCalledTimes(1);
  });

  it('can load svg image strings', async () => {
    const svgImage = ex.ImageSource.fromSvgString(`
      <svg version="1.1"
        id="svg2"
        xmlns:sodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd"
        xmlns:inkscape="http://www.inkscape.org/namespaces/inkscape"
        sodipodi:docname="resize-full.svg" inkscape:version="0.48.4 r9939"
        xmlns="http://www.w3.org/2000/svg" 
        width="800px" height="800px"
        viewBox="0 0 1200 1200" enable-background="new 0 0 1200 1200" xml:space="preserve">
    <path id="path18934" fill="#000000ff" inkscape:connector-curvature="0"  d="M670.312,0l177.246,177.295L606.348,418.506l175.146,175.146
        l241.211-241.211L1200,529.688V0H670.312z M418.506,606.348L177.295,847.559L0,670.312V1200h529.688l-177.246-177.295
        l241.211-241.211L418.506,606.348z"/>
    </svg>
    `);
    const whenLoaded = jasmine.createSpy('whenLoaded');
    await svgImage.load();
    await svgImage.ready.then(whenLoaded);
    expect(svgImage.image.src).not.toBeNull();
    expect(whenLoaded).toHaveBeenCalledTimes(1);
  });

  it('can load svg images', async () => {
    const svgImage = new ex.ImageSource('src/spec/images/GraphicsImageSourceSpec/arrows.svg');
    const whenLoaded = jasmine.createSpy('whenLoaded');
    await svgImage.load();
    await svgImage.ready.then(whenLoaded);
    expect(svgImage.image.src).not.toBeNull();
    expect(whenLoaded).toHaveBeenCalledTimes(1);

    expect(svgImage.width).toBe(800);
    expect(svgImage.height).toBe(800);
  });

  it('will log a warning if images are too large for mobile', async () => {
    const canvasElement = document.createElement('canvas');
    canvasElement.width = 100;
    canvasElement.height = 100;
    const webgl = new ex.ExcaliburGraphicsContextWebGL({
      canvasElement: canvasElement,
      enableTransparency: false,
      backgroundColor: ex.Color.White
    });
    const logger = ex.Logger.getInstance();
    spyOn(logger, 'warn');
    spyOn(logger, 'error');

    const sut = new ex.ImageSource('src/spec/images/GraphicsImageSourceSpec/big-image.png');

    await sut.load();

    expect(logger.warn).toHaveBeenCalledWith(
      `The image [src/spec/images/GraphicsImageSourceSpec/big-image.png] provided to excalibur` +
        ` is too large may not work on all mobile devices, it is recommended you resize images to a maximum (4096x4096).\n\n` +
        `Images will likely render as black rectangles on some mobile platforms.\n\n` +
        `Read more here: https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/WebGL_best_practices#understand_system_limits`
    );
    expect(logger.error).not.toHaveBeenCalled();
  });

  it('will log an error if images are too large for the current platform', async () => {
    const canvasElement = document.createElement('canvas');
    canvasElement.width = 100;
    canvasElement.height = 100;
    const webgl = new ex.ExcaliburGraphicsContextWebGL({
      canvasElement: canvasElement,
      enableTransparency: false,
      backgroundColor: ex.Color.White
    });
    const logger = ex.Logger.getInstance();
    spyOn(logger, 'warn');
    spyOn(logger, 'error');

    (ex.TextureLoader as any)._MAX_TEXTURE_SIZE = 4096;

    const sut = new ex.ImageSource('src/spec/images/GraphicsImageSourceSpec/big-image.png');

    await sut.load();

    expect(logger.warn).not.toHaveBeenCalled();
    expect(logger.error).toHaveBeenCalledWith(
      `The image [src/spec/images/GraphicsImageSourceSpec/big-image.png] provided to Excalibur is too large for the device's maximum ` +
        `texture size of (4096x4096) please resize to an image for excalibur to render properly.\n\n` +
        `Images will likely render as black rectangles.\n\n` +
        `Read more here: https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/WebGL_best_practices#understand_system_limits`
    );
  });

  it('can load images with an image filtering Blended', async () => {
    const canvas = document.createElement('canvas');
    const webgl = new ex.ExcaliburGraphicsContextWebGL({
      canvasElement: canvas
    });
    const imageRenderer = new ImageRenderer({ pixelArtSampler: false, uvPadding: 0 });
    imageRenderer.initialize(webgl.__gl, webgl);
    spyOn(webgl.textureLoader, 'load').and.callThrough();

    const spriteFontImage = new ex.ImageSource('src/spec/images/GraphicsTextSpec/spritefont.png', false, ex.ImageFiltering.Blended);
    const whenLoaded = jasmine.createSpy('whenLoaded');
    const image = await spriteFontImage.load();
    await spriteFontImage.ready.then(whenLoaded);

    imageRenderer.draw(image, 0, 0);

    expect(image.src).not.toBeNull();
    expect(whenLoaded).toHaveBeenCalledTimes(1);
    expect(webgl.textureLoader.load).toHaveBeenCalledWith(
      image,
      {
        filtering: ex.ImageFiltering.Blended,
        wrapping: {
          x: ex.ImageWrapping.Clamp,
          y: ex.ImageWrapping.Clamp
        }
      },
      false
    );
  });

  it('can load images with an image filtering Pixel', async () => {
    const canvas = document.createElement('canvas');
    const webgl = new ex.ExcaliburGraphicsContextWebGL({
      canvasElement: canvas
    });
    const imageRenderer = new ImageRenderer({ pixelArtSampler: false, uvPadding: 0 });
    imageRenderer.initialize(webgl.__gl, webgl);
    spyOn(webgl.textureLoader, 'load').and.callThrough();

    const spriteFontImage = new ex.ImageSource('src/spec/images/GraphicsTextSpec/spritefont.png', false, ex.ImageFiltering.Pixel);
    const whenLoaded = jasmine.createSpy('whenLoaded');
    const image = await spriteFontImage.load();
    await spriteFontImage.ready.then(whenLoaded);

    imageRenderer.draw(image, 0, 0);

    expect(image.src).not.toBeNull();
    expect(whenLoaded).toHaveBeenCalledTimes(1);
    expect(webgl.textureLoader.load).toHaveBeenCalledWith(
      image,
      {
        filtering: ex.ImageFiltering.Pixel,
        wrapping: {
          x: ex.ImageWrapping.Clamp,
          y: ex.ImageWrapping.Clamp
        }
      },
      false
    );
  });

  it('can load images with an image wrap repeat', async () => {
    const canvas = document.createElement('canvas');
    const webgl = new ex.ExcaliburGraphicsContextWebGL({
      canvasElement: canvas
    });
    const imageRenderer = new ImageRenderer({ pixelArtSampler: false, uvPadding: 0 });
    imageRenderer.initialize(webgl.__gl, webgl);
    spyOn(webgl.textureLoader, 'load').and.callThrough();

    const spriteFontImage = new ex.ImageSource('src/spec/images/GraphicsTextSpec/spritefont.png', {
      filtering: ex.ImageFiltering.Pixel,
      wrapping: ex.ImageWrapping.Repeat
    });
    const whenLoaded = jasmine.createSpy('whenLoaded');
    const image = await spriteFontImage.load();
    await spriteFontImage.ready.then(whenLoaded);

    imageRenderer.draw(image, 0, 0);

    expect(image.src).not.toBeNull();
    expect(whenLoaded).toHaveBeenCalledTimes(1);
    expect(webgl.textureLoader.load).toHaveBeenCalledWith(
      image,
      {
        filtering: ex.ImageFiltering.Pixel,
        wrapping: {
          x: ex.ImageWrapping.Repeat,
          y: ex.ImageWrapping.Repeat
        }
      },
      false
    );
  });

  it('can load images with an image wrap repeat', async () => {
    const canvas = document.createElement('canvas');
    const webgl = new ex.ExcaliburGraphicsContextWebGL({
      canvasElement: canvas
    });
    const imageRenderer = new ImageRenderer({ pixelArtSampler: false, uvPadding: 0 });
    imageRenderer.initialize(webgl.__gl, webgl);
    spyOn(webgl.textureLoader, 'load').and.callThrough();

    const spriteFontImage = new ex.ImageSource('src/spec/images/GraphicsTextSpec/spritefont.png', {
      filtering: ex.ImageFiltering.Pixel,
      wrapping: ex.ImageWrapping.Mirror
    });
    const whenLoaded = jasmine.createSpy('whenLoaded');
    const image = await spriteFontImage.load();
    await spriteFontImage.ready.then(whenLoaded);

    imageRenderer.draw(image, 0, 0);

    expect(image.src).not.toBeNull();
    expect(whenLoaded).toHaveBeenCalledTimes(1);
    expect(webgl.textureLoader.load).toHaveBeenCalledWith(
      image,
      {
        filtering: ex.ImageFiltering.Pixel,
        wrapping: {
          x: ex.ImageWrapping.Mirror,
          y: ex.ImageWrapping.Mirror
        }
      },
      false
    );
  });

  it('can load images with an image wrap mixed', async () => {
    const canvas = document.createElement('canvas');
    const webgl = new ex.ExcaliburGraphicsContextWebGL({
      canvasElement: canvas
    });
    const imageRenderer = new ImageRenderer({ pixelArtSampler: false, uvPadding: 0 });
    imageRenderer.initialize(webgl.__gl, webgl);
    spyOn(webgl.textureLoader, 'load').and.callThrough();
    const texParameteri = spyOn(webgl.__gl, 'texParameteri').and.callThrough();
    const gl = webgl.__gl;

    const spriteFontImage = new ex.ImageSource('src/spec/images/GraphicsTextSpec/spritefont.png', {
      filtering: ex.ImageFiltering.Pixel,
      wrapping: {
        x: ex.ImageWrapping.Mirror,
        y: ex.ImageWrapping.Clamp
      }
    });
    const whenLoaded = jasmine.createSpy('whenLoaded');
    const image = await spriteFontImage.load();
    await spriteFontImage.ready.then(whenLoaded);

    imageRenderer.draw(image, 0, 0);

    expect(image.src).not.toBeNull();
    expect(whenLoaded).toHaveBeenCalledTimes(1);
    expect(texParameteri.calls.argsFor(0)).toEqual([gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.MIRRORED_REPEAT]);
    expect(texParameteri.calls.argsFor(1)).toEqual([gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE]);
    expect(webgl.textureLoader.load).toHaveBeenCalledWith(
      image,
      {
        filtering: ex.ImageFiltering.Pixel,
        wrapping: {
          x: ex.ImageWrapping.Mirror,
          y: ex.ImageWrapping.Clamp
        }
      },
      false
    );
  });

  it('can convert to a Sprite', async () => {
    const spriteFontImage = new ex.ImageSource('src/spec/images/GraphicsTextSpec/spritefont.png');
    const sprite = spriteFontImage.toSprite();

    // Sprites have no width/height until the underlying image is loaded
    expect(sprite.width).toBe(0);
    expect(sprite.height).toBe(0);

    const image = await spriteFontImage.load();
    await spriteFontImage.ready;
    expect(sprite.width).toBe(image.width);
    expect(sprite.height).toBe(image.height);
  });

  it('can convert to a Sprite with options', async () => {
    const spriteFontImage = new ex.ImageSource('src/spec/images/GraphicsTextSpec/spritefont.png');
    const sprite = spriteFontImage.toSprite({
      sourceView: {
        x: 16,
        y: 16,
        width: 16,
        height: 16
      },
      destSize: {
        width: 32,
        height: 32
      }
    });

    // Sprites have no width/height until the underlying image is loaded
    expect(sprite.width).toBe(32);
    expect(sprite.height).toBe(32);

    const image = await spriteFontImage.load();
    await spriteFontImage.ready;
    expect(sprite.width).toBe(32);
    expect(sprite.height).toBe(32);
  });

  it('can unload from memory', async () => {
    const spriteFontImage = new ex.ImageSource('src/spec/images/GraphicsTextSpec/spritefont.png');
    await spriteFontImage.load();
    expect(spriteFontImage.image.src).not.toBeNull();
    spriteFontImage.unload();
    expect(spriteFontImage.image.src).toBe('');
  });

  it('will resolve the image if already loaded', async () => {
    const spriteFontImage = new ex.ImageSource('src/spec/images/GraphicsTextSpec/spritefont.png');
    const image = await spriteFontImage.load();

    expect(spriteFontImage.isLoaded()).toBe(true);
    const alreadyLoadedImage = await spriteFontImage.load();

    expect(image).toBe(alreadyLoadedImage);
  });

  it('will load base64 strings', async () => {
    const base64Image = new ex.ImageSource(
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+P+/HgAFhAJ/wlseKgAAAABJRU5ErkJggg=='
    );
    await base64Image.load();

    expect(base64Image.isLoaded()).toBe(true);
    expect(base64Image.image.src).toBe(
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+P+/HgAFhAJ/wlseKgAAAABJRU5ErkJggg=='
    );
  });

  it("will return error if image doesn't exist", async () => {
    const spriteFontImage = new ex.ImageSource('42.png');

    await expectAsync(spriteFontImage.load()).toBeRejectedWith("Error loading ImageSource from path '42.png' with error [Not Found]");
  });
});
