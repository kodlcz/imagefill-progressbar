
export class ImageFillProgressBarConfig {
  /**
   * The duration in milliseconds of the animation.
   */
  public animationDurationMs: number;

  /**
   * Flag whether to show or hide the numeric display.
   */
  public showNumericDisplay: boolean;

  /**
   * Formatter function for the numeric display.
   * Supports html strings.
   */
  public numericDisplayFormatter: (val: number) => string;

  /**
   * Called when the progress bar reaches 100%.
   */
  public onComplete: () => void;

  /**
   * The function describing the animation progression.
   */
  public easingFunction: (t: number) => number;

  /**
   * The src of the background image.
   */
  public backgroundSrc?: string;

  /**
   * The src of the foreground image.
   */
  public foregroundSrc?: string;

  /**
   * The width in pixels of the rendered progress bar.
   */
  public width?: number;

  /**
   * The height in pixels of the rendered progress bar.
   */
  public height?: number;
}
