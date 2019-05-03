## Using Groups

Groups can be used to detect collisions across a large number of actors. For example
perhaps a large group of "enemy" actors.

```typescript
const enemyShips = engine.currentScene.createGroup("enemy");
const enemies = [...]; // Large array of enemies;
enemyShips.add(enemies);
const player = new Actor();
engine.currentScene.add(player);
enemyShips.on('precollision', function(ev: CollisionEvent){
  if (e.other === player) {
      //console.log("collision with player!");
  }
});
```
