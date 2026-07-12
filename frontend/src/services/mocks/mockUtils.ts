/**
 * Helpers shared by mock service adapters. These exist only so the UI can exercise
 * realistic loading/empty/error states before the backend is ready.
 */

/** Simulate network latency so mock-backed screens still show loading states. */
export const mockDelay = (ms = 400): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms))
