# Spatial Audio ECS Planning

## Goal
Build out ECS-style spatial audio support in Excalibur by adding components and systems that connect actors to the existing `SpatialAudio` interface.

## Context
A basic spatial audio hook exists in `src/engine/resources/sound` with `SpatialAudioOptions` and `WebAudioInstance` support for `PannerNode`. The next step is to make spatial audio usable through Excalibur's entity-component-system so moving actors can act as audio sources and listeners.

## Objectives
- Add `SpatialAudioSourceComponent` for emitting sounds from entities.
- Add `SpatialAudioListenerComponent` for camera/player listener entities.
- Add a `SpatialAudioSystem` to update listener/source positions and runtime panner configuration.
- Keep the existing `Sound` and `WebAudioInstance` plumbing as the playback backend.

## Proposed design
1. `SpatialAudioSourceComponent`
   - Fields:
     - `sound: Sound`
     - `spatial?: SpatialAudioOptions`
     - `volume?: number`
     - `loop?: boolean`
     - `autoPlay?: boolean`
   - Behavior:
     - Uses entity `TransformComponent.globalPos` for panner position.
     - Optionally auto-starts sound when component is added or entity becomes active.
     - Exposes update hooks for dynamic position and orientation.

2. `SpatialAudioListenerComponent`
   - Fields:
     - `position?: Vector` (or derived from `TransformComponent`)
     - `orientation?: { x: number; y: number; z: number }`
     - `up?: { x: number; y: number; z: number }`
   - Behavior:
     - Updates the shared `AudioContext.listener` each frame.
     - Supports one primary listener per scene or multiple listeners if desired.

3. `SpatialAudioSystem`
   - Query entities with `TransformComponent + SpatialAudioSourceComponent`.
   - Query the active `SpatialAudioListenerComponent` entity.
   - On update:
     - sync listener transform to `AudioContext.listener`.
     - sync source position/orientation to each `WebAudioInstance` panner.
     - optionally handle enable/disable and per-frame attenuation defaults.

4. Backend integration
   - `Sound.play()` currently accepts `PlayOptions.spatial`.
   - Source component should create or manage a `WebAudioInstance` and call `newSound.play({ spatial })` when needed.
   - For persistent sources, support updating the active instance's panner position after playback begins.

## Tasks
1. Audit current ECS component conventions
   - Review `Component`, `Entity`, and `System` patterns.
   - Confirm how components are serialized/added.

2. Create component types
   - `src/engine/audio/spatial-audio-source-component.ts`
   - `src/engine/audio/spatial-audio-listener-component.ts`

3. Create the system
   - `src/engine/audio/spatial-audio-system.ts`
   - Register it in `src/engine/engine.ts` or scene initialization.

4. Extend existing sound API as needed
   - Add methods to `WebAudioInstance` for updating panner state.
   - Add helper methods in `Sound` or a new `SpatialAudioSource` wrapper.

5. Add tests
   - Unit tests for component creation and system updates.
   - Integration tests verifying listener and source transform sync.

6. Example usage
   - Add a small usage example/story showing:
     - a player entity with `SpatialAudioListenerComponent`
     - an enemy or object with `SpatialAudioSourceComponent`
     - moving source updates spatial audio in real time

## Success criteria
- A source component can play spatial sound from an entity.
- A listener component updates the audio listener each frame.
- Panner position/orientation updates follow entity movement.
- Existing non-spatial sound behavior remains unchanged.

## Notes
- Keep the spatial system focused on transform-driven audio and leave global sound management to `SoundManager`.
- Consider whether the listener should be scene-scoped or engine-scoped.
- Preserve one-shot playback support in `Sound.play({ spatial })` for immediate spatial sound effects.
