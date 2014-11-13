/// <reference path="../Interfaces/IPipelineModule.ts" />
var ex;
(function (ex) {
    var CollisionDetectionModule = (function () {
        function CollisionDetectionModule() {
        }
        CollisionDetectionModule.prototype.update = function (actor, engine, delta) {
            var _this = this;
            var eventDispatcher = actor.eventDispatcher;
            if (actor.collisionType !== ex.CollisionType.PreventCollision) {
                // Retrieve the list of potential colliders, exclude killed, prevented, and self
                var potentialColliders = engine.currentScene.children.filter(function (other) {
                    return !other.isKilled() && other.collisionType !== ex.CollisionType.PreventCollision && actor !== other;
                });

                for (var i = 0; i < potentialColliders.length; i++) {
                    var intersectActor;
                    var side;
                    var collider = potentialColliders[i];

                    if (intersectActor = actor.collides(collider)) {
                        side = actor.getSideFromIntersect(intersectActor);
                        actor.scene.addCollisionPair(new ex.CollisionPair(actor, collider, intersectActor, side));

                        var actorCollisionGroups = actor.getCollisionHandlers();
                        collider.collisionGroups.forEach(function (group) {
                            if (actorCollisionGroups[group]) {
                                actorCollisionGroups[group].forEach(function (handler) {
                                    handler.call(_this, collider);
                                });
                            }
                        });
                    }
                }

                for (var j = 0; j < engine.currentScene.tileMaps.length; j++) {
                    var map = engine.currentScene.tileMaps[j];
                    var intersectMap;
                    var side = ex.Side.None;
                    var max = 2;
                    var hasBounced = false;
                    while (intersectMap = map.collides(actor)) {
                        if (max-- < 0) {
                            break;
                        }
                        side = actor.getSideFromIntersect(intersectMap);
                        eventDispatcher.publish('collision', new ex.CollisionEvent(actor, null, side, intersectMap));
                        if ((actor.collisionType === ex.CollisionType.Active || actor.collisionType === ex.CollisionType.Elastic) && collider.collisionType !== ex.CollisionType.Passive) {
                            actor.y += intersectMap.y;
                            actor.x += intersectMap.x;

                            // Naive elastic bounce
                            if (actor.collisionType === ex.CollisionType.Elastic && !hasBounced) {
                                hasBounced = true;
                                if (side === ex.Side.Left) {
                                    actor.dx = Math.abs(actor.dx);
                                } else if (side === ex.Side.Right) {
                                    actor.dx = -Math.abs(actor.dx);
                                } else if (side === ex.Side.Top) {
                                    actor.dy = Math.abs(actor.dy);
                                } else if (side === ex.Side.Bottom) {
                                    actor.dy = -Math.abs(actor.dy);
                                }
                            }
                        }
                    }
                }
            }
        };
        return CollisionDetectionModule;
    })();
    ex.CollisionDetectionModule = CollisionDetectionModule;
})(ex || (ex = {}));
//# sourceMappingURL=CollisionDetectionModule.js.map
