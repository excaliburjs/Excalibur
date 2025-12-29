export interface State<TData> {
  name?: string;
  transitions: string[];
  onEnter?: (context: { from: string; eventData?: any; data: TData }) => boolean | void;
  onState?: () => any;
  onExit?: (context: { to: string; data: TData }) => boolean | void;
  onUpdate?: (data: TData, elapsed: number) => any;
}

export interface StateMachineDescription<TData = any> {
  start: string;
  states: { [name: string]: State<TData> };
}

export type PossibleStates<TMachine> = TMachine extends StateMachineDescription ? Extract<keyof TMachine['states'], string> : never;

export interface StateMachineState<TData> {
  data: TData;
  currentState: string;
}

export class StateMachine<TPossibleStates extends string, TData> {
  public startState: State<TData>;
  private _currentState: State<TData>;
  public get currentState(): State<TData> {
    return this._currentState;
  }
  public set currentState(state: State<TData>) {
    this._currentState = state;
  }
  public states = new Map<string, State<TData>>();
  public data: TData;

  static create<TMachine extends StateMachineDescription<TData>, TData>(
    machineDescription: TMachine,
    data?: TData
  ): StateMachine<PossibleStates<TMachine>, TData> {
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
        const canExit = this.currentState?.onExit({ to: potentialNewState.name, data: this.data });
        if (canExit === false) {
          return false;
        }
      }

      if (potentialNewState?.onEnter) {
        const canEnter = potentialNewState?.onEnter({ from: this.currentState.name, eventData, data: this.data });
        if (canEnter === false) {
          return false;
        }
      }
      this.currentState = potentialNewState;
      if (this.currentState?.onState) {
        this.currentState.onState();
      }
      return true;
    }
    return false;
  }

  update(elapsed: number) {
    if (this.currentState.onUpdate) {
      this.currentState.onUpdate(this.data, elapsed);
    }
  }

  save(saveKey: string) {
    localStorage.setItem(
      saveKey,
      JSON.stringify({
        currentState: this.currentState.name,
        data: this.data
      })
    );
  }

  restore(saveKey: string) {
    const state: StateMachineState<TData> = JSON.parse(localStorage.getItem(saveKey));
    this.currentState = this.states.get(state.currentState);
    this.data = state.data;
  }
}
