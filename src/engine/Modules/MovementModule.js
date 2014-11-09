/// <reference path="../Interfaces/IPipelineModule.ts" />
var ex;
(function (ex) {
    var MovementModule = (function () {
        function MovementModule() {
        }
        MovementModule.prototype.update = function (actor, engine, delta) {
            // Update placements based on linear algebra
            actor.x += actor.dx * delta / 1000;
            actor.y += actor.dy * delta / 1000;

            actor.dx += actor.ax * delta / 1000;
            actor.dy += actor.ay * delta / 1000;

            actor.rotation += actor.rx * delta / 1000;

            actor.scaleX += actor.sx * delta / 1000;
            actor.scaleY += actor.sy * delta / 1000;
        };
        return MovementModule;
    })();
    ex.MovementModule = MovementModule;
})(ex || (ex = {}));
//# sourceMappingURL=MovementModule.js.map
