import { useState, useEffect, useCallback } from 'react';
import {
  updateTournamentStatus,
  getActiveTournament,
  getUpcomingTournament,
  addTournamentParticipant,
  updateTournamentScore,
  createTournament,
} from '../utils/tournamentUtils';

export const useTournament = (currentUser) => {
  const [activeTournament, setActiveTournament] = useState(null);
  const [upcomingTournament, setUpcomingTournament] = useState(null);
  const [tournamentStatusChanged, setTournamentStatusChanged] = useState(false);

  // Check for tournament status updates
  useEffect(() => {
    const checkTournamentStatus = () => {
      const statusUpdated = updateTournamentStatus();
      if (statusUpdated) {
        setTournamentStatusChanged(true);
        setTimeout(() => setTournamentStatusChanged(false), 3000);
      }

      setActiveTournament(getActiveTournament());
      setUpcomingTournament(getUpcomingTournament());
    };

    // Check immediately
    checkTournamentStatus();

    // Check every 30 seconds
    const interval = setInterval(checkTournamentStatus, 30000);

    return () => clearInterval(interval);
  }, []);

  const joinTournament = useCallback((tournamentId, username) => {
    if (username && tournamentId) {
      addTournamentParticipant(tournamentId, username);
      setActiveTournament(getActiveTournament());
    }
  }, []);

  const submitTournamentScore = useCallback(
    (username, score, gameTime, moves) => {
      if (activeTournament && username) {
        updateTournamentScore(username, score, gameTime, moves);
        setActiveTournament(getActiveTournament());
      }
    },
    [activeTournament]
  );

  const createNewTournament = useCallback(
    (tournamentData) => {
      const success = createTournament(tournamentData, currentUser, () => {});
      if (success) {
        setUpcomingTournament(getUpcomingTournament());
      }
      return success;
    },
    [currentUser]
  );

  return {
    activeTournament,
    upcomingTournament,
    tournamentStatusChanged,
    joinTournament,
    submitTournamentScore,
    createNewTournament,
  };
};
