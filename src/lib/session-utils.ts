export type SessionWindowStatus = 'before_window' | 'in_window' | 'passed';

export interface BookingTimeDetails {
  startTime: Date;
  endTime: Date;
  status: string;
}

const PRE_SESSION_WINDOW_MINUTES = 15;

/**
 * Determines the current time-based status of a session window.
 */
export function getSessionWindow(booking: BookingTimeDetails, currentTime = new Date()): SessionWindowStatus {
  const start = new Date(booking.startTime);
  const end = new Date(booking.endTime);
  
  // The earliest time they can join
  const windowStart = new Date(start.getTime() - PRE_SESSION_WINDOW_MINUTES * 60000);
  
  if (currentTime < windowStart) {
    return 'before_window';
  }
  
  if (currentTime > end) {
    return 'passed';
  }
  
  return 'in_window';
}

/**
 * Determines if a user can currently join the meeting.
 */
export function canJoinMeeting(booking: BookingTimeDetails, currentTime = new Date()): boolean {
  if (booking.status !== 'CONFIRMED') {
    return false;
  }
  
  const windowStatus = getSessionWindow(booking, currentTime);
  return windowStatus === 'in_window';
}
