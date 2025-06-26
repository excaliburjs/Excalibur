import * as ex from '@excalibur';

describe('A StateMachine', () => {
  it('exists', () => {
    expect(ex.StateMachine).toBeDefined();
  });

  it('can construct a state machine', () => {
    const machine = ex.StateMachine.create({
      start: 'STOPPED',
      states: {
        PLAYING: {
          transitions: ['STOPPED', 'PAUSED']
        },
        STOPPED: {
          transitions: ['PLAYING']
        },
        PAUSED: {
          transitions: ['PLAYING', 'STOPPED']
        }
      }
    });

    expect(machine.currentState.name).toBe('STOPPED');
    expect(machine.startState.name).toBe('STOPPED');
    expect(Array.from(machine.states.keys())).toEqual(['PLAYING', 'STOPPED', 'PAUSED']);
    expect(machine).toBeDefined();
  });

  it('will throw on an invalid state machine', () => {
    expect(() => {
      const machine = ex.StateMachine.create({
        start: 'STOPPED',
        states: {
          PLAYING: {
            transitions: ['STOPPED', 'DOESNTEXIST']
          },
          STOPPED: {
            transitions: ['PLAYING']
          },
          PAUSED: {
            transitions: ['PLAYING', 'STOPPED']
          }
        }
      });
    }).toThrow(new Error(`Invalid state machine, state [PLAYING] has a transition to another state that doesn't exist [DOESNTEXIST]`));
  });

  it('can transition to valid state', () => {
    const machine = ex.StateMachine.create({
      start: 'STOPPED',
      states: {
        PLAYING: {
          transitions: ['STOPPED', 'PAUSED']
        },
        STOPPED: {
          transitions: ['PLAYING', 'SEEK']
        },
        SEEK: {
          transitions: ['*']
        },
        PAUSED: {
          transitions: ['PLAYING', 'STOPPED']
        }
      }
    });

    expect(machine.go('PLAYING')).toBe(true);
    expect(machine.go('PAUSED')).toBe(true);
    expect(machine.go('STOPPED')).toBe(true);

    // No implicit self transition
    expect(machine.go('STOPPED')).toBe(false);
    expect(machine.go('SEEK')).toBe(true);
    expect(machine.go('PLAYING')).toBe(true);
  });

  it('can prevent transition onEnter', () => {
    const enterSpy = vi.fn(() => false);
    const exitSpy = vi.fn(() => false);
    const machine = ex.StateMachine.create({
      start: 'PING',
      states: {
        PING: {
          transitions: ['PONG']
        },
        PONG: {
          onEnter: enterSpy,
          onExit: exitSpy,
          transitions: ['PING']
        }
      }
    });

    expect(machine.go('PONG')).toBe(false);
    enterSpy.mockImplementation(() => true);
    expect(machine.go('PONG')).toBe(true);
    expect(machine.go('PING')).toBe(false);
    exitSpy.mockImplementation(() => true);
    expect(machine.go('PING')).toBe(true);
  });

  it('can pass data to states', () => {
    const enterSpy = vi.fn(() => true);
    const exitSpy = vi.fn(() => true);
    const machine = ex.StateMachine.create(
      {
        start: 'PING',
        states: {
          PING: {
            transitions: ['PONG']
          },
          PONG: {
            onEnter: enterSpy,
            onExit: exitSpy,
            transitions: ['PING']
          }
        }
      },
      {
        data: 42
      }
    );

    machine.go('PONG');
    expect(enterSpy).toHaveBeenCalledWith({ from: 'PING', eventData: undefined, data: { data: 42 } });
    machine.go('PING');
    expect(exitSpy).toHaveBeenCalledWith({ to: 'PING', data: { data: 42 } });
  });

  it('can update the current state', () => {
    const updateSpy = vi.fn(() => true);
    const machine = ex.StateMachine.create(
      {
        start: 'PING',
        states: {
          PING: {
            transitions: ['PONG']
          },
          PONG: {
            onUpdate: updateSpy,
            transitions: ['PING']
          }
        }
      },
      {
        data: 42
      }
    );

    machine.go('PONG');
    machine.update(100);
    expect(updateSpy).toHaveBeenCalledWith({ data: 42 }, 100);
  });

  it('can save a state machine to local storage and restore it with the correct state and data', () => {
    const machine = ex.StateMachine.create(
      {
        start: 'PING',
        states: {
          PING: {
            onEnter: ({ data }) => {
              data.data++;
            },
            transitions: ['PONG']
          },
          PONG: {
            onEnter: ({ data }) => {
              data.data++;
            },
            transitions: ['PING']
          }
        }
      },
      {
        data: 42
      }
    );
    machine.go('PONG');
    expect(machine.data.data).toBe(43);
    machine.go('PING');
    expect(machine.data.data).toBe(44);
    machine.go('PONG');
    expect(machine.data.data).toBe(45);

    machine.save('my-machine-state');

    const newMachine = ex.StateMachine.create(
      {
        start: 'PING',
        states: {
          PING: {
            onEnter: ({ data }) => {
              data.data++;
            },
            transitions: ['PONG']
          },
          PONG: {
            onEnter: ({ data }) => {
              data.data++;
            },
            transitions: ['PING']
          }
        }
      },
      {
        data: 42
      }
    );

    newMachine.restore('my-machine-state');
    expect(newMachine.currentState.name).toBe('PONG');
    expect(newMachine.data.data).toBe(45);
  });
});
