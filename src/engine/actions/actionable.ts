import type { ActionContext } from './action-context';

export interface Actionable {
  actions: ActionContext;
}
