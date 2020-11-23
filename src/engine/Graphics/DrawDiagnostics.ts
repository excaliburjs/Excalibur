export class DrawDiagnostics {
  public static DrawCallCount: number = 0;
  public static DrawnImagesCount: number = 0;
  public static clear(): void {
    DrawDiagnostics.DrawCallCount = 0;
    DrawDiagnostics.DrawnImagesCount = 0;
  }
}
