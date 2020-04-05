
export interface ImageFillProgressBarConfig {
  /**
   * The container where the loader is rendered
   * can be a css selector or an HTML element
   */
  container: string | HTMLElement;

  /**
   * The duration in milliseconds of the animation.
   * Default: 1000
   */
  animationDurationMs?: number;

  /**
   * Flag whether to show or hide the numeric display.
   * Default: true
   */
  showNumericDisplay?: boolean;

  /**
   * Formatter function for the numeric display.
   * Supports html strings.
   */
  numericDisplayFormatter?: (val: number) => string;

  /**
   * Called when the progress bar reaches 100%.
   */
  onComplete?: () => void;

  /**
   * The function describing the animation progression.
   */
  easingFunction?: (t: number) => number;

  /**
   * The src of the background image.
   */
  backgroundSrc: string;

  /**
   * The src of the foreground image.
   */
  foregroundSrc: string;
}
