
export interface State {
  name?: string;
  transitions: string[];
  onEnter?: (context: {from: string, eventData?: any, data: any}) => boolean | void;
  onState?: () => any;
  onExit?: (context: {to: string, data: any}) => boolean | void;
  onUpdate?: (data: any, elapsedMs: number) => any;
}

export interface StateMachineDescription {
  start: string,
  states: { [name: string]: State }
}

export type PossibleStates<TMachine> = TMachine extends StateMachineDescription ? Extract<keyof TMachine['states'], string> : never;

export interface StateMachineState {
  data: any;
  currentState: string;
}

export class StateMachine<TPossibleStates extends string, TData> {
  public startState: State;
  private _currentState: State;
  public get currentState(): State {
    return this._currentState;
  }
  public set currentState(state: State) {
    this._currentState = state;
  }
  public states = new Map<string, State>();
  public data: TData;

  static create<TMachine extends StateMachineDescription, TData>(
    machineDescription: TMachine, data?: TData): StateMachine<PossibleStates<TMachine>, TData> {
    const machine = new StateMachine<PossibleStates<TMachine>, TData>();
    machine.data = data;
    for (const stateName in machineDescription.states) {
      machine.states.set(stateName as PossibleStates<TMachine>, {
        name: stateName,
        ...machineDescription.states[stateName]
      });
    }

    // validate transitions are states
    for (const state of machine.states.values()) {
      for (const transitionState of state.transitions) {
        if (transitionState === '*') {
          continue;
        }
        if (!machine.states.has(transitionState)) {
          throw Error(
            `Invalid state machine, state [${state.name}] has a transition to another state that doesn't exist [${transitionState}]`
          );
        }
      }
    }
    machine.currentState = machine.startState = machine.states.get(machineDescription.start);
    return machine;
  }

  in(state: TPossibleStates): boolean {
    return this.currentState.name === state;
  }

  go(stateName: TPossibleStates, eventData?: any): boolean {
    if (this.currentState.transitions.includes(stateName) || this.currentState.transitions.includes('*')) {
      const potentialNewState = this.states.get(stateName);
      if (this.currentState.onExit) {
        const canExit = this.currentState?.onExit({to: potentialNewState.name, data: this.data});
        if (canExit === false) {
          return false;
        }
      }

      if (potentialNewState?.onEnter) {
        const canEnter = potentialNewState?.onEnter({from: this.currentState.name, eventData, data: this.data});
        if (canEnter === false) {
          return false;
        }
      }
      // console.log(`${this.currentState.name} => ${potentialNewState.name} (${eventData})`);
      this.currentState = potentialNewState;
      if (this.currentState?.onState) {
        this.currentState.onState();
      }
      return true;
    }
    return false;
  }

  update(elapsedMs: number) {
    if (this.currentState.onUpdate) {
      this.currentState.onUpdate(this.data, elapsedMs);
    }
  }

  save(saveKey: string) {
    localStorage.setItem(saveKey, JSON.stringify({
      currentState: this.currentState.name,
      data: this.data
    }));
  }

  restore(saveKey: string) {
    const state: StateMachineState = JSON.parse(localStorage.getItem(saveKey));
    this.currentState = this.states.get(state.currentState);
    this.data = state.data;
  }
}

