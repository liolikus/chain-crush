import { useState, useEffect, useCallback } from 'react';
import {
  validateLoginInput,
  authenticateUser,
  saveUserSession,
  loadSavedSession,
  clearUserSession,
} from '../utils/authUtils';

export const useAuth = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const { userData, credentials } = loadSavedSession();

    if (userData) {
      setCurrentUser(userData);
      setIsLoggedIn(true);
      setIsAdmin(userData.isAdmin || false);
    }

    if (credentials) {
      setUsername(credentials.username);
      setPassword(credentials.password);
    }
  }, []);

  const handleLogin = useCallback(
    (e) => {
      e.preventDefault();
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
    },
    [username, password]
  );

  const handleLogout = useCallback(() => {
    clearUserSession();
    setCurrentUser(null);
    setIsLoggedIn(false);
    setIsAdmin(false);
    setUsername('');
    setPassword('');
  }, []);

  return {
    isLoggedIn,
    showLogin,
    username,
    password,
    loginError,
    currentUser,
    isAdmin,
    setShowLogin,
    setUsername,
    setPassword,
    setCurrentUser,
    handleLogin,
    handleLogout,
  };
};
