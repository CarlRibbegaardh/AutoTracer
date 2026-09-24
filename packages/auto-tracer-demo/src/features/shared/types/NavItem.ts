/**
 * Configuration for a navigation menu item
 */
export interface NavItem {
  /**
   * Route path for this navigation item
   */
  readonly path: string;

  /**
   * Display label for the menu item
   */
  readonly label: string;

  /**
   * Material-UI icon component to display
   */
  readonly icon: React.ElementType;
}
