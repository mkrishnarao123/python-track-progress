/**
 * Centralized auth utilities to avoid duplicate sessionStorage access
 */

/**
 * Get the auth token from sessionStorage
 * @returns {string|null} Auth token or null if not found
 */
export function getAuthToken() {
  try {
    return sessionStorage.getItem('authToken');
  } catch (e) {
    console.warn('Failed to get auth token', e);
    return null;
  }
}

/**
 * Get the auth user object from sessionStorage
 * @returns {Object|null} Auth user object or null if not found
 */
export function getAuthUser() {
  try {
    const userStr = sessionStorage.getItem('authUser');
    return userStr ? JSON.parse(userStr) : null;
  } catch (e) {
    console.warn('Failed to parse auth user', e);
    return null;
  }
}

/**
 * Get the auth user ID from sessionStorage
 * @returns {string|number|null} User ID or null if not found
 */
export function getAuthUserId() {
  const user = getAuthUser();
  return user?.id || null;
}

/**
 * Store auth data in sessionStorage
 * @param {string} token - Auth token
 * @param {Object} user - User object
 */
export function setAuthData(token, user) {
  try {
    sessionStorage.setItem('authToken', token);
    sessionStorage.setItem('authUser', JSON.stringify(user));
  } catch (e) {
    console.warn('Failed to set auth data', e);
  }
}

/**
 * Clear all auth data from sessionStorage
 */
export function clearAuthData() {
  try {
    sessionStorage.removeItem('authToken');
    sessionStorage.removeItem('authUser');
  } catch (e) {
    console.warn('Failed to clear auth data', e);
  }
}
