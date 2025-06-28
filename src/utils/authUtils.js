import { checkIsAdmin } from './adminUtils';

// Simple hash function for demo purposes (in production, use proper hashing)
const simpleHash = (str) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return hash.toString(16);
};

export const validateLoginInput = (username, password) => {
  if (!username.trim() || !password.trim()) {
    return 'Please enter both username and password';
  }

  if (username.length < 3) {
    return 'Username must be at least 3 characters long';
  }

  if (password.length < 4) {
    return 'Password must be at least 4 characters long';
  }

  return null;
};

export const authenticateUser = (username, password) => {
  const existingUser = localStorage.getItem(`chainCrushUser_${username.trim()}`);
  let userData;

  if (existingUser) {
    userData = JSON.parse(existingUser);
    // Verify password hash
    const hashedPassword = simpleHash(password);
    if (userData.passwordHash !== hashedPassword) {
      throw new Error('Incorrect password for this username');
    }
    // Update last login time
    userData.lastLogin = Date.now();
  } else {
    // Create new user with hashed password
    const hashedPassword = simpleHash(password);
    userData = {
      username: username.trim(),
      passwordHash: hashedPassword, // Store hash instead of plain password
      createdAt: Date.now(),
      lastLogin: Date.now(),
      gamesPlayed: 0,
      totalScore: 0,
      bestScore: 0,
    };
  }

  // Check if user is admin
  const isUserAdmin = checkIsAdmin(username);
  userData.isAdmin = isUserAdmin;

  return { userData, isUserAdmin };
};

export const saveUserSession = (userData) => {
  // Save user data without password
  const sessionData = {
    ...userData,
    passwordHash: undefined // Remove password hash from session data
  };
  
  localStorage.setItem(`chainCrushUser_${userData.username}`, JSON.stringify(userData));
  localStorage.setItem('chainCrushUser', JSON.stringify(sessionData));
  localStorage.setItem('chainCrushSession', JSON.stringify({
    username: userData.username,
    isLoggedIn: true,
    lastLogin: Date.now(),
    sessionId: Math.random().toString(36).substr(2, 9) // Simple session ID
  }));
};

export const loadSavedSession = () => {
  const savedUser = localStorage.getItem('chainCrushUser');
  const savedSession = localStorage.getItem('chainCrushSession');

  let userData = null;
  let session = null;

  if (savedUser) {
    userData = JSON.parse(savedUser);
  }

  if (savedSession) {
    session = JSON.parse(savedSession);
  }

  return { userData, session };
};

export const clearUserSession = () => {
  localStorage.removeItem('chainCrushUser');
  localStorage.removeItem('chainCrushSession');
};

export const isSessionValid = () => {
  const savedSession = localStorage.getItem('chainCrushSession');
  if (!savedSession) return false;
  
  try {
    const session = JSON.parse(savedSession);
    const now = Date.now();
    const sessionAge = now - session.lastLogin;
    const maxSessionAge = 24 * 60 * 60 * 1000; // 24 hours
    
    return session.isLoggedIn && sessionAge < maxSessionAge;
  } catch (error) {
    return false;
  }
};
