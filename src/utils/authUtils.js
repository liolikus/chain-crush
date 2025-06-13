import { checkIsAdmin } from './adminUtils';

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
    // Verify password
    if (userData.password !== password) {
      throw new Error('Incorrect password for this username');
    }
    // Update last login time
    userData.lastLogin = Date.now();
  } else {
    // Create new user
    userData = {
      username: username.trim(),
      password: password,
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
  // Save user data and credentials
  localStorage.setItem(`chainCrushUser_${userData.username}`, JSON.stringify(userData));
  localStorage.setItem('chainCrushUser', JSON.stringify(userData));
  localStorage.setItem(
    'chainCrushCredentials',
    JSON.stringify({
      username: userData.username,
      password: userData.password,
    })
  );
};

export const loadSavedSession = () => {
  const savedUser = localStorage.getItem('chainCrushUser');
  const savedCredentials = localStorage.getItem('chainCrushCredentials');

  let userData = null;
  let credentials = null;

  if (savedUser) {
    userData = JSON.parse(savedUser);
  }

  if (savedCredentials) {
    credentials = JSON.parse(savedCredentials);
  }

  return { userData, credentials };
};

export const clearUserSession = () => {
  localStorage.removeItem('chainCrushUser');
};
