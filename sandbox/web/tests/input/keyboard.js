/// <reference path="../../../../dist/Excalibur.d.ts"/>
var game = new ex.Engine(800, 600, "game");
var label = new ex.Label(null, 400, 300, "48px Arial");
label.color = ex.Color.Chartreuse;
label.textAlign = 2 /* Center */;

game.add(label);

game.on("update", function (ue) {
    var keys = game.input.keyboard.getKeys().map(function (k) {
        return (ex.Input.Keys[k] || "Unknown") + "(" + k.toString() + ")";
    }).join(", ");

    label.text = keys;
});

game.start();
//# sourceMappingURL=keyboard.js.map
