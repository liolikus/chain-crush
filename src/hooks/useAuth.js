import { useState, useEffect, useCallback } from 'react';
import {
  validateLoginInput,
  authenticateUser,
  saveUserSession,
  loadSavedSession,
  clearUserSession,
  isSessionValid,
} from '../utils/authUtils';

export const useAuth = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Check if there's a valid session on mount
    if (isSessionValid()) {
      const { userData } = loadSavedSession();
      if (userData) {
        setCurrentUser(userData);
        setIsLoggedIn(true);
        setIsAdmin(userData.isAdmin || false);
      }
    }
  }, []);

  const handleLogin = useCallback((username, password) => {
    setLoginError('');

    const validationError = validateLoginInput(username, password);
    if (validationError) {
      setLoginError(validationError);
      return;
    }

    try {
      const { userData, isUserAdmin } = authenticateUser(username, password);
      saveUserSession(userData);

      setCurrentUser(userData);
      setIsLoggedIn(true);
      setIsAdmin(isUserAdmin);
      setShowLogin(false);
    } catch (error) {
      setLoginError(error.message);
    }
  }, []);

  const handleLogout = useCallback(() => {
    clearUserSession();
    setCurrentUser(null);
    setIsLoggedIn(false);
    setIsAdmin(false);
  }, []);

  return {
    isLoggedIn,
    showLogin,
    loginError,
    currentUser,
    isAdmin,
    setShowLogin,
    setCurrentUser,
    handleLogin,
    handleLogout,
  };
};
