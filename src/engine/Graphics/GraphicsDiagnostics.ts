export class GraphicsDiagnostics {
  public static DrawCallCount: number = 0;
  public static DrawnImagesCount: number = 0;
  public static clear(): void {
    GraphicsDiagnostics.DrawCallCount = 0;
    GraphicsDiagnostics.DrawnImagesCount = 0;
  }
}
