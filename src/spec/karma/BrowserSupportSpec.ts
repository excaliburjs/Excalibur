describe('Browser integration test', () => {
  it('should boot on browser', (done) => {
    const boot = () => {
      const game = new ex.Engine({
        width: 800,
        height: 800
      });
      game.start().then(() => {
        done();
      });
    };

    expect(boot).not.toThrow();
  });

  it('should allow pointers', (done) => {
    const downSpy = jasmine.createSpy('down');
    class Game2 extends ex.Engine {
      initialize() {
        const player1 = new ex.Actor({ x: 0, y: 0, width: 100, height: 100, color: ex.Color.Red });
        this.add(player1);
        player1.z = 10;
        player1.on('pointerdown', downSpy);

        return this.start();
      }
    }

    const pointer = () => {
      const game2 = new Game2({ width: 600, height: 400 });

      game2.initialize().then(() => {
        game2.input.pointers.triggerEvent('down', ex.vec(0, 0));
        expect(downSpy).toHaveBeenCalledTimes(1);
        done();
      });
    };

    expect(pointer).not.toThrow();
  });
});
