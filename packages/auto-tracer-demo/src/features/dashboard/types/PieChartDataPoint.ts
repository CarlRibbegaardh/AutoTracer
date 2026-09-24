/**
 * Data structure for a pie chart entry
 */
export interface PieChartDataPoint {
  /**
   * Name/label for the pie slice
   */
  readonly name: string;

  /**
   * Value for the slice size
   */
  readonly value: number;

  /**
   * Color to render the slice
   */
  readonly color: string;
}
