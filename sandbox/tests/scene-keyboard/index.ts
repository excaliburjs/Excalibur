var a = new ex.Scene();
a.on('initialize', () => {
  console.log('a input:', a.input.keyboard);
  // console.log('b input:', b.input.keyboard);
  a.input.pointers.primary.on('down', (e) => {
    a.engine.goToScene('b');
  });
  a.input.keyboard.on('press', (e) => {
    console.log('a input:', a.input.keyboard.getKeys());
    if (e.key === ex.Keys.Key1) {
      a.engine.goToScene('b');
    }
  });
});

var b = new ex.Scene();
b.backgroundColor = ex.Color.DarkGray;
b.on('initialize', () => {
  // console.log('a input:', a.input.keyboard);
  console.log('b input:', b.input.keyboard);
  b.input.pointers.primary.on('down', (e) => {
    b.engine.goToScene('a');
  });
  b.input.keyboard.on('press', (e) => {
    console.log('a input:', a.input.keyboard.getKeys());
    console.log('b input:', b.input.keyboard.getKeys());
    if (e.key === ex.Keys.Key2) {
      b.engine.goToScene('a');
    }
  });
});

var game6 = new ex.Engine({
  scenes: { a, b }
});

game6.goToScene('a');
game6.start();
