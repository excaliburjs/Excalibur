import { createContext, useContext } from '../Context';
import { EventEmitter } from '../EventEmitter';

export const HostContext = createContext<Host>();

export const useHost = () => {
  return useContext(HostContext);
};

export interface Host {
  events: EventEmitter;
  getScreenWidth(): number;
  getScreenHeight(): number;
  setAttribute(targetElement: string, name: string, value: any): void;
  getAttribute(targetElement: string, name: string, value: any): string;
  setStyleProperty(targetElement: string, name: string, value: any): void;
  getStyleProperty(targetElement: string, name: string): string;
  scheduleNextFrameCallback(callback: FrameRequestCallback): number;
  cancelNextFrameCallback(handle: number): void;
  isCrossOriginIframe(): boolean;
  focus(): void;
  devicePixelRatio: number;
  now(): number;
  isElement(el: any): boolean;
}
