var game = new ex.Engine({
    width: 400, height: 400
});
game.input.keyboard.on('up', function (ev) {
    if (ev.key === ex.Input.Keys.W) {
        increaseTimescale();
    }
    else if (ev.key === ex.Input.Keys.S) {
        decreaseTimescale();
    }
});
game.on('update', function () {
    document.getElementById('timescale').innerText = game.timescale.toString() + 'x';
});
game.start().then(function () {
    var rect = new ex.Actor(200, 200, 50, 50, ex.Color.Red);
    rect.actions
        .easeTo(300, 200, 600, ex.EasingFunctions.EaseOutCubic)
        .easeTo(200, 200, 600, ex.EasingFunctions.EaseOutCubic)
        .repeatForever();
    game.add(rect);
});
function increaseTimescale() {
    game.timescale += 0.1;
}
function decreaseTimescale() {
    game.timescale -= 0.1;
}
//# sourceMappingURL=timescale.js.map