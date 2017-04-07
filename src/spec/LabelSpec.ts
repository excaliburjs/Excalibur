/// <reference path="jasmine.d.ts" />
/// <reference path="support/js-imagediff.d.ts" />
/// <reference path="require.d.ts" />
/// <reference path="Mocks.ts" />

describe('A label', () => {
   var label: ex.Label;
   var engine: ex.Engine;
   var scene: ex.Scene;

   beforeEach(() => {
      jasmine.addMatchers(imagediff.jasmine);
      engine = new ex.Engine({
         width: 500,
         height: 500,
         suppressConsoleBootMessage: true,
         suppressMinimumBrowserFeatureDetection: true
      });

      label = new ex.Label('Test string', 100, 100);
      label.fontFamily = 'Verdana';
      scene = new ex.Scene(engine);
      engine.currentScene = scene;

      scene.add(label);		        
   });

   it('should be loaded', () => {
      expect(ex.Label).toBeTruthy();
   });

   it('should be loaded', () => {
      expect(ex.Label).toBeTruthy();
   });

   it('should have text', () => {
      expect(label.text).toBe('Test string');
   });

   it('should default to black', () => {
      expect(label.color.toString()).toBe(ex.Color.Black.toString());
   });

   it('can change color', (done) => {
      label.text = 'some blue text';
      label.fontSize = 30;
      label.color = ex.Color.Blue.clone();

      expect(label.color.toString()).toBe(ex.Color.Blue.toString());

      label.update(engine, 100);
      label.draw(engine.ctx, 100);
      expect(label.color.toString()).toBe(ex.Color.Blue.toString());
      imagediff.expectCanvasImageMatches('LabelSpec/bluetext.png', engine.canvas, done);
   });

   it('to enable italic fontStyle', (done) => {
      label.text = 'some italic text';
      label.fontSize = 30;
      label.color = ex.Color.Black;
      label.fontStyle = ex.FontStyle.Italic;
      label.draw(engine.ctx, 100);

      imagediff.expectCanvasImageMatches('LabelSpec/italictext.png', engine.canvas, done);
   });

   it('to enable oblique fontStyle', (done) => {
      label.text = 'some oblique text';
      label.fontSize = 30;
      label.color = ex.Color.Black;
      label.fontStyle = ex.FontStyle.Oblique;
      label.draw(engine.ctx, 100);
      // phantom will show oblique text as italic :(
      imagediff.expectCanvasImageMatches('LabelSpec/obliquetext.png', engine.canvas, done);
      
   });

   it('to enable normal fontStyle', (done) => {
      label.text = 'some normal text';
      label.fontFamily = 'Arial';
      label.fontSize = 30;
      label.color = ex.Color.Black;
      label.bold = false;
      label.fontStyle = ex.FontStyle.Normal;

      label.draw(engine.ctx, 100);
      imagediff.expectCanvasImageMatches('LabelSpec/normaltext.png', engine.canvas, done);
   });

   it('to enable bold text', (done) => {
      label.text = 'some bold text';
      label.fontFamily = 'Arial';
      label.fontSize = 30;
      label.color = ex.Color.Black;
      label.bold = true;

      label.draw(engine.ctx, 100);
      imagediff.expectCanvasImageMatches('LabelSpec/boldtext.png', engine.canvas, done);
   });

   it('to enable right aligned text', (done) => {
      label.x = 200;
      label.text = 'some right aligned text';
      label.fontSize = 30;
      label.color = ex.Color.Blue;
      label.textAlign = ex.TextAlign.Right;
      label.draw(engine.ctx, 100);

      imagediff.expectCanvasImageMatches('LabelSpec/righttext.png', engine.canvas, done);
   });

   it('to enable left aligned text', (done) => {
      label.x = 200;
      label.text = 'some left aligned text';
      label.fontSize = 30;
      label.color = ex.Color.Blue;
      label.textAlign = ex.TextAlign.Left;
      label.draw(engine.ctx, 100);

      imagediff.expectCanvasImageMatches('LabelSpec/lefttext.png', engine.canvas, done);
   });

   it('to enable center aligned text', (done) => {
      label.x = 200;
      label.text = 'some center aligned text';
      label.fontSize = 30;
      label.color = ex.Color.Blue;
      label.textAlign = ex.TextAlign.Center;
      label.draw(engine.ctx, 100);

      imagediff.expectCanvasImageMatches('LabelSpec/centertext.png', engine.canvas, done);
   });

   it('can measure text width', () => {
      label.x = 200;
      label.text = 'some text to measure';
      label.fontSize = 30;
      label.color = ex.Color.Blue;
      label.textAlign = ex.TextAlign.Center;
      label.draw(engine.ctx, 100);
      expect(label.getTextWidth(engine.ctx)).toBe(360);
   });
});