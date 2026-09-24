/**
 * Creates a gate that permits one terminal outcome.
 *
 * @returns An operation that claims terminal emission exactly once.
 */
export function createTerminalOutcomeGate(): () => boolean {
  let claimed = false;

  /** Claims terminal emission when it has not already been claimed. */
  function claimTerminalOutcome(): boolean {
    if (claimed) {
      return false;
    }

    claimed = true;
    return true;
  }

  return claimTerminalOutcome;
}
