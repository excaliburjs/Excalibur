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

   it('can change color', () => {
      label.color = ex.Color.Blue.clone();

      expect(label.color.toString()).toBe(ex.Color.Blue.toString());

      label.update(engine, 100);
      label.draw(engine.ctx, 100);
      expect(label.color.toString()).toBe(ex.Color.Blue.toString());
   });

   it('to enable italic fontStyle', (done) => {
      label.text = 'some italic text';
      label.fontSize = 30;
      label.color = ex.Color.Black;
      label.fontStyle = ex.FontStyle.Italic;
      label.draw(engine.ctx, 100);

      imagediff.expectCanvasImageMatches('LabelSpec/italictext.png', engine.canvas, done);
   });

   it('to enable bold fontStyle', (done) => {
      label.text = 'some bold text';
      label.fontFamily = 'Arial';
      label.fontSize = 30;
      label.color = ex.Color.Black;
      label.fontStyle = ex.FontStyle.Bold;
      label.draw(engine.ctx, 100);

      imagediff.expectCanvasImageMatches('LabelSpec/italictext.png', engine.canvas, done);
   });
});