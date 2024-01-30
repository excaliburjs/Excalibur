import { Engine } from 'excalibur';

declare global {
  declare namespace ex {
    export * from 'excalibur';
  }
  var game: Engine;
}
