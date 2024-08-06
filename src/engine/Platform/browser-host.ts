import { EventEmitter } from '../EventEmitter';
import { Host } from './host';

export class BrowserHost implements Host {
  events: EventEmitter<any>;
  getScreenWidth(): number {
    throw new Error('Method not implemented.');
  }
  getScreenHeight(): number {
    throw new Error('Method not implemented.');
  }
  setAttribute(name: string, value: any): void {
    throw new Error('Method not implemented.');
  }
  getAttribute(name: string, value: any): string {
    throw new Error('Method not implemented.');
  }
  setStyleProperty(targetElement: string, name: string, value: any): void {
    throw new Error('Method not implemented.');
  }
  getStyleProperty(targetElement: string, name: string): string {
    throw new Error('Method not implemented.');
  }
  scheduleNextFrameCallback(callback: FrameRequestCallback): number {
    throw new Error('Method not implemented.');
  }
  cancelNextFrameCallback(handle: number): void {
    throw new Error('Method not implemented.');
  }
  isCrossOriginIframe(): boolean {
    throw new Error('Method not implemented.');
  }
  focus(): void {
    throw new Error('Method not implemented.');
  }
  devicePixelRatio: number;
  now(): number {
    throw new Error('Method not implemented.');
  }
  isElement(el: any): boolean {
    if (typeof HTMLElement !== 'undefined') {
      return el instanceof HTMLElement;
    }
    return false;
  }
}
