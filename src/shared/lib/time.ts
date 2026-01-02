/**
 * Format a given time in seconds into a human-readable string.
 * @param seconds The time in seconds.
 * @returns A string representing the uptime in hours, minutes, and seconds.
 */
export function formatTime(seconds: number): string {
  // Calculate the number of hours, minutes, and seconds
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  // Create an array of parts to format the string
  const parts = [];
  if (hrs > 0) parts.push(`${hrs}h`); // Add hours if there are any
  if (mins > 0) parts.push(`${mins}m`); // Add minutes if there are any
  parts.push(`${secs}s`); // Always add seconds

  // Join the parts with spaces and return the result
  return parts.join(" ");
}
