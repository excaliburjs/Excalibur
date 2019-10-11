export type ComponentType = string | BuiltinComponentType;

// Enum contianing the builtin component types
export enum BuiltinComponentType {
  Transform = 'transform',
  Drawing = 'drawing',
  DrawCollider = 'drawcollider',
  Action = 'action',
  Offscreen = 'offscreen',
  Body = 'body',
  Lifetime = 'lifetime',
  Debug = 'debug'
}
