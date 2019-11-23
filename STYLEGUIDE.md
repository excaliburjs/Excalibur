# Excalibur Style Guide

## General Code:

#### DO

- Prefer readable code over shorter code
- Prefer code locality over dynamism, code that is related should be near each other
- Use modern ES features like `const` or `let`
- Write tests for all new code
- Provide JSDoc comments on all methods

#### CONSIDER

- Keeping methods short < 100 lines
- Using the SOLID principles where possible ([the course by Mark Seemann is good](https://www.pluralsight.com/courses/encapsulation-solid))
  - **S**ingle Responsibility Principle
  - **O**pen-closed Principle
  - **L**iskov substitution principle
  - **I**nterface segregation principle
  - **D**ependency inversion principle

#### AVOID

- Using `function()`

#### DON’T

- Use the `var` keyword

## Classes:

#### DO

- Only name things with “Base” if they are an abstract class, or cannot be instantiated normally

#### CONSIDER

-

#### AVOID

- Using inheritance, prefer composition when building up types
- Using the singleton pattern, consider factory or an adapter pattern

#### DON’T

- Name things with a “Base” if they can be instantiated normally

## Methods:

#### DO

- Have descriptive and verbose parameter names, especially for similar looking methods
- Use JavaScript getters/setters for things that feel like properties, but have logic behind them
- Use getters for things that should be strict `readonly` properties
- Use properties for quantities that have no logic behind them
- Use methods for commands, performing an action, or making queries
- Prefer verbs like `show()` or `hide()` for booleans instead of properties like `.isVisible = true`
  - Example: `isDebug` should be `enableDebug()`/`disableDebug()` or `toggleDebug() // returns current mode`

#### CONSIDER

- Consider `get` or `set` when needing to return non-trivial types or perform non-trivial calculation, for example `getConfiguration()`
- Shorter descriptive names over longer names
- Prefer less words over more where appropriate
- Use option bags for parameters with interface typings, for example

```typescript
export interface EngineOptions { … }
class Engine {
    constructor(options?: EngineOptions) {
       ...
    }
    ...
}
```

#### AVOID

- The words `get` or `set` for primitive types like `number` or `string`
  Abbreviations for parameter names

#### DON’T

- Make parameter lists larger than 3 required parameters `someMethod(parm1, param2, param3, param4)`, use an option bag.

## Interfaces:

#### DO

- Name with a verb suffix “-able” or "-like", for example `Updatable` or `Drawable` except in the case of option bag parameters

#### CONSIDER

- Keep interfaces short and simple, if they get too large can they be broken into **multiple** interfaces. See the **Interface Segregation Principle**

### DON’T

- Use an “I” prefix, do not use things like `IDrawable` should be `Drawable`

## Enums

#### DO

- Use `number`ed or `string` enums, preferring `string` enums for more robust type support, robust refactorings, and debuggability at run-time

```typescript
export enum CollisionType {
  /**
   * Actors with the `PreventCollision` setting do not participate in any
   * collisions and do not raise collision events.
   */
  PreventCollision = 'PreventCollision',
  /**
   * Actors with the `Passive` setting only raise collision events, but are not
   * influenced or moved by other actors and do not influence or move other actors.
   */
  Passive = 'Passive',
  /**
   * Actors with the `Active` setting raise collision events and participate
   * in collisions with other actors and will be push or moved by actors sharing
   * the `Active` or `Fixed` setting.
   */
  Active = 'Active',
  /**
   * Actors with the `Fixed` setting raise collision events and participate in
   * collisions with other actors. Actors with the `Fixed` setting will not be
   * pushed or moved by other actors sharing the `Fixed`. Think of Fixed
   * actors as "immovable/unstoppable" objects. If two `Fixed` actors meet they will
   * not be pushed or moved by each other, they will not interact except to throw
   * collision events.
   */
  Fixed = 'Fixed'
}
```
