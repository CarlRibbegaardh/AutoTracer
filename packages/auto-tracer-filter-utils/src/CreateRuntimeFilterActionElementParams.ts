/**
 * Parameters for creating a runtime filter action element.
 */
export type CreateRuntimeFilterActionElementParams = {
  /**
   * Icon/label shown to the user.
   */
  readonly iconText: string;

  /**
   * Tooltip/title for the element.
   */
  readonly title: string;

  /**
   * Click handler that performs the filter action.
   */
  readonly onClick: () => void;
};
