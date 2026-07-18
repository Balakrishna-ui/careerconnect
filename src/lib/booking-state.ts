export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'REJECTED' | 'CANCELLED' | 'COMPLETED';

// Define valid transitions from each state
const VALID_TRANSITIONS: Record<BookingStatus, BookingStatus[]> = {
  PENDING: ['CONFIRMED', 'REJECTED', 'CANCELLED'],
  CONFIRMED: ['COMPLETED', 'CANCELLED'],
  REJECTED: [],
  CANCELLED: [],
  COMPLETED: [],
};

export class BookingStateMachine {
  /**
   * Checks if a transition from `currentStatus` to `newStatus` is valid.
   * Throws an error if invalid.
   */
  static validateTransition(currentStatus: string, newStatus: string): void {
    const fromStatus = currentStatus as BookingStatus;
    const toStatus = newStatus as BookingStatus;
    
    // Ensure both are valid statuses
    if (!VALID_TRANSITIONS[fromStatus]) {
      throw new Error(`Invalid current status: ${currentStatus}`);
    }

    const allowed = VALID_TRANSITIONS[fromStatus].includes(toStatus);
    
    if (!allowed) {
      throw new Error(`Invalid state transition: Cannot change booking from ${currentStatus} to ${newStatus}`);
    }
  }

  /**
   * Returns true if transition is allowed, false otherwise without throwing.
   */
  static canTransition(currentStatus: string, newStatus: string): boolean {
    try {
      this.validateTransition(currentStatus, newStatus);
      return true;
    } catch {
      return false;
    }
  }
}
