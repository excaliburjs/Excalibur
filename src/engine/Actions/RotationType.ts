module ex {
   /**
    * An enum that describes the strategies that rotation actions can use
    */
   export enum RotationType {
      /**
       * Rotation via `ShortestPath` will use the smallest angle
       * between the starting and ending points. This strategy is the default behavior.
       */
      ShortestPath = 0,
      /**
       * Rotation via `LongestPath` will use the largest angle
       * between the starting and ending points.
       */
      LongestPath = 1,
      /**
       * Rotation via `Clockwise` will travel in a clockwise direction,
       * regardless of the starting and ending points.
       */
      Clockwise = 2,
      /**
       * Rotation via `CounterClockwise` will travel in a counterclockwise direction,
       * regardless of the starting and ending points.
       */
      CounterClockwise = 3
   }
}