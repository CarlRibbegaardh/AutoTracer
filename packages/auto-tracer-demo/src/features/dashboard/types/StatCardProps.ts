/**
 * Properties for a statistics display card
 */
export interface StatCardProps {
  /**
   * Title displayed above the value
   */
  readonly title: string;

  /**
   * Numeric value to display
   */
  readonly value: number;

  /**
   * Material-UI icon component to display
   */
  readonly icon: React.ElementType;

  /**
   * Color to apply to the icon
   */
  readonly color: string;
}
