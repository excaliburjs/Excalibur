import * as ex from 'excalibur';
import { BladeApi, FolderApi, Pane, TabApi, TabPageApi } from 'tweakpane';
import { PickerSystem } from './picker-system';
export declare class DevTool {
  engine: ex.Engine;
  pane: Pane;
  tabs: TabApi;
  pickerSystem: PickerSystem;
  pointerPos: {
    x: number;
    y: number;
  };
  highlightedEntities: number[];
  selectedEntity: ex.Actor | null;
  selectedEntityId: number;
  currentResolution: ex.ScreenDimension;
  currentViewport: ex.ScreenDimension;
  resolutionText: BladeApi<any>;
  viewportText: BladeApi<any>;
  screenFolder: FolderApi;
  selectedEntityTab: TabPageApi;
  selectedEntityFolder: FolderApi;
  screenTab: TabPageApi;
  cameraTab: TabPageApi;
  timerTab: TabPageApi;
  clockTab: TabPageApi;
  physicsTab: TabPageApi;
  debugTab: TabPageApi;
  pointerPosInput: any;
  constructor(engine: ex.Engine);
  /**
   * Add any event listeners relevant to the devtool
   */
  addListeners(): void;
  selectEntityById(id: number): void;
  /**
   * `update()` is called periodically over time
   * @param devtool
   */
  update(devtool: DevTool): void;
  private _installPickerSystemIfNeeded;
  private _buildMain;
  private _buildEntityUI;
  private _buildColliderUI;
  private _buildParticleEmitterUI;
  private _buildGraphicsUI;
  private _buildMotionUI;
  private _buildTransformUI;
  private _buildScreenTab;
  private _buildCameraTab;
  private _buildClockTab;
  private _timersFolder;
  private _buildTimersTab;
  private _buildPhysicsTab;
  private _buildDebugSettingsTab;
}
