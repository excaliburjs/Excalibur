var game = new ex.Engine({ width: 800, height: 600, canvasElementId: "game" });
var label = new ex.Label(null, 400, 300, "48px Arial");
label.color = ex.Color.Chartreuse;
label.textAlign = ex.TextAlign.Center;
game.add(label);
game.on("postupdate", function (ue) {
    var keys = game.input.keyboard.getKeys().map(function (k) {
        return (ex.Input.Keys[k] || "Unknown") + "(" + k.toString() + ")";
    }).join(", ");
    label.text = keys;
});
game.start();
//# sourceMappingURL=keyboard.js.map