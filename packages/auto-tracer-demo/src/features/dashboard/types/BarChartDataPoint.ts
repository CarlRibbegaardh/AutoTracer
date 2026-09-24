/**
 * Data structure for a bar chart entry
 */
export interface BarChartDataPoint {
  /**
   * Status label for the bar
   */
  readonly status: string;

  /**
   * Count value for the bar height
   */
  readonly count: number;
}
