/// <reference path="../Interfaces/IPipelineModule.ts" />
var ex;
(function (ex) {
    /**
    * Propogates input events to the actor (i.e. PointerEvents)
    */
    var InputPropagationModule = (function () {
        function InputPropagationModule() {
        }
        InputPropagationModule.prototype.update = function (actor, engine, delta) {
            if (!actor.inputEnabled)
                return;
            if (actor.isKilled())
                return;

            engine.input.pointer.propogate(actor);
        };
        return InputPropagationModule;
    })();
    ex.InputPropagationModule = InputPropagationModule;
})(ex || (ex = {}));
//# sourceMappingURL=InputPropagationModule.js.map
