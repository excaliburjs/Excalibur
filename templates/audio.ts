export default `
import * as ex from 'excalibur';
console.log('hello, world');

const resources = {
    sound: new ex.Sound('./rpg-audio/audio/handleCoins.ogg'),
} as const;

const loader = new ex.Loader(Object.values(resources));

const game = new ex.Engine({
    canvasElementId: 'preview-canvas',
    displayMode: ex.DisplayMode.FitContainer,
    width: 592,
    height: 400,
});

game.start(loader).then(() => {
    game.input.pointers.primary.on('up', function () {
        resources.sound.play(0.5);
    });
});

`;