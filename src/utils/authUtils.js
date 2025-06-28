import { checkIsAdmin } from './adminUtils';

// Simple hash function for demo purposes (in production, use proper hashing)
const simpleHash = (str) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return hash.toString(16);
};

// Migration function to handle existing admin users
const migrateAdminUser = (username, password) => {
  const existingUser = localStorage.getItem(`chainCrushUser_${username.trim()}`);
  if (!existingUser) return null;

  try {
    const userData = JSON.parse(existingUser);

    // If user exists but doesn't have passwordHash, it's an old user
    if (!userData.passwordHash && userData.password) {
      // Check if the plain password matches
      if (userData.password === password) {
        // Migrate to new hashed system
        const hashedPassword = simpleHash(password);
        const migratedUser = {
          ...userData,
          passwordHash: hashedPassword,
          password: undefined, // Remove plain password
        };
        localStorage.setItem(`chainCrushUser_${username.trim()}`, JSON.stringify(migratedUser));
        return migratedUser;
      }
    }

    return userData;
  } catch (error) {
    console.error('Error migrating user:', error);
    return null;
  }
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
  const trimmedUsername = username.trim();

  // Debug logging for admin users
  if (checkIsAdmin(trimmedUsername)) {
    console.log('Attempting to authenticate admin user:', trimmedUsername);
    debugAdminUser(trimmedUsername);
  }

  // First, try to migrate existing admin user
  const migratedUser = migrateAdminUser(trimmedUsername, password);
  let userData;

  if (migratedUser) {
    userData = migratedUser;
    // Update last login time
    userData.lastLogin = Date.now();
    if (checkIsAdmin(trimmedUsername)) {
      console.log('Admin user migrated successfully');
    }
  } else {
    // Check for existing user with new system
    const existingUser = localStorage.getItem(`chainCrushUser_${trimmedUsername}`);

    if (existingUser) {
      userData = JSON.parse(existingUser);
      // Verify password hash
      const hashedPassword = simpleHash(password);
      if (userData.passwordHash !== hashedPassword) {
        if (checkIsAdmin(trimmedUsername)) {
          console.log('Admin password verification failed');
          console.log('Expected hash:', userData.passwordHash);
          console.log('Provided hash:', hashedPassword);
        }
        throw new Error('Incorrect password for this username');
      }
      // Update last login time
      userData.lastLogin = Date.now();
      if (checkIsAdmin(trimmedUsername)) {
        console.log('Admin user authenticated successfully');
      }
    } else {
      // Create new user with hashed password
      const hashedPassword = simpleHash(password);
      userData = {
        username: trimmedUsername,
        passwordHash: hashedPassword,
        createdAt: Date.now(),
        lastLogin: Date.now(),
        gamesPlayed: 0,
        totalScore: 0,
        bestScore: 0,
      };
      if (checkIsAdmin(trimmedUsername)) {
        console.log('New admin user created');
      }
    }
  }

  // Check if user is admin
  const isUserAdmin = checkIsAdmin(trimmedUsername);
  userData.isAdmin = isUserAdmin;

  return { userData, isUserAdmin };
};

export const saveUserSession = (userData) => {
  // Save user data without password
  const sessionData = {
    ...userData,
    passwordHash: undefined, // Remove password hash from session data
  };

  localStorage.setItem(`chainCrushUser_${userData.username}`, JSON.stringify(userData));
  localStorage.setItem('chainCrushUser', JSON.stringify(sessionData));
  localStorage.setItem(
    'chainCrushSession',
    JSON.stringify({
      username: userData.username,
      isLoggedIn: true,
      lastLogin: Date.now(),
      sessionId: Math.random().toString(36).substr(2, 9), // Simple session ID
    })
  );
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

// Debug function to help troubleshoot admin login issues
export const debugAdminUser = (username) => {
  const trimmedUsername = username.trim();
  const userKey = `chainCrushUser_${trimmedUsername}`;
  const existingUser = localStorage.getItem(userKey);

  console.log('=== Admin User Debug ===');
  console.log('Username:', trimmedUsername);
  console.log('Is Admin (checkIsAdmin):', checkIsAdmin(trimmedUsername));
  console.log('User exists in localStorage:', !!existingUser);

  if (existingUser) {
    try {
      const userData = JSON.parse(existingUser);
      console.log('User data:', {
        username: userData.username,
        hasPassword: !!userData.password,
        hasPasswordHash: !!userData.passwordHash,
        isAdmin: userData.isAdmin,
        createdAt: userData.createdAt,
        lastLogin: userData.lastLogin,
      });
    } catch (error) {
      console.error('Error parsing user data:', error);
    }
  }

  console.log('All admin usernames:', ['admin', 'moderator', 'chaincrush_admin']);
  console.log('========================');
};
