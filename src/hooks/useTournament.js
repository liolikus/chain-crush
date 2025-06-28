import { useState, useEffect, useCallback } from 'react';
import {
  getActiveTournament,
  updateTournamentStatus,
  forceUpdateTournamentStatuses,
  addTournamentScore,
  getTournaments,
  createTournament,
  deleteTournament,
  validateTournamentDates,
  formatTournamentTime,
  getClosestUpcomingTournament
} from '../utils/tournamentUtils';

export const useTournament = () => {
  const [activeTournament, setActiveTournament] = useState(null);
  const [tournaments, setTournaments] = useState([]);
  const [tournamentTimeLeft, setTournamentTimeLeft] = useState(0);
  const [upcomingTournament, setUpcomingTournament] = useState(null);
  const [timeUntilUpcoming, setTimeUntilUpcoming] = useState(0);
  const [showCreateTournament, setShowCreateTournament] = useState(false);
  const [createTournamentForm, setCreateTournamentForm] = useState({
    name: '',
    startDate: '',
    startTime: '',
    endDate: '',
    endTime: ''
  });
  const [createError, setCreateError] = useState('');

  // Load tournaments and force update statuses on mount
  useEffect(() => {
    forceUpdateTournamentStatuses();
    loadTournaments();
  }, []);

  // Update tournament status and find active tournament
  useEffect(() => {
    const statusInterval = setInterval(() => {
      updateTournamentStatus();
      const active = getActiveTournament();
      setActiveTournament(active);
    }, 5000); // Update status every 5 seconds

    const displayInterval = setInterval(() => {
      if (activeTournament) {
        const now = Date.now();
        const oneMinuteAfterEnd = 60 * 1000; // 1 minute in milliseconds
        const isGracePeriod = activeTournament.endDate <= now && (activeTournament.endDate + oneMinuteAfterEnd) > now;
        
        let timeLeft;
        if (isGracePeriod) {
          // During grace period, show time left until leaderboard disappears
          timeLeft = (activeTournament.endDate + oneMinuteAfterEnd) - now;
        } else {
          // Normal tournament time
          timeLeft = activeTournament.endDate - now;
        }
        
        setTournamentTimeLeft(Math.max(0, timeLeft));
      } else {
        setTournamentTimeLeft(0);
      }

      // Update upcoming tournament timer
      const upcoming = getClosestUpcomingTournament();
      setUpcomingTournament(upcoming);
      
      if (upcoming) {
        const timeUntil = upcoming.startDate - Date.now();
        setTimeUntilUpcoming(Math.max(0, timeUntil));
      } else {
        setTimeUntilUpcoming(0);
      }
    }, 1000); // Update display every second

    return () => {
      clearInterval(statusInterval);
      clearInterval(displayInterval);
    };
  }, [activeTournament]);

  const loadTournaments = useCallback(() => {
    const allTournaments = getTournaments();
    setTournaments(allTournaments);
  }, []);

  const handleCreateTournament = useCallback((e) => {
    e.preventDefault();
    setCreateError('');

    const { name, startDate, startTime, endDate, endTime } = createTournamentForm;
    
    if (!name.trim()) {
      setCreateError('Tournament name is required');
      return;
    }

    const startDateTime = new Date(`${startDate}T${startTime}`);
    const endDateTime = new Date(`${endDate}T${endTime}`);
    
    const validationError = validateTournamentDates(startDateTime, endDateTime);
    if (validationError) {
      setCreateError(validationError);
      return;
    }

    try {
      createTournament(name, startDateTime, endDateTime);
      setCreateTournamentForm({
        name: '',
        startDate: '',
        startTime: '',
        endDate: '',
        endTime: ''
      });
      setShowCreateTournament(false);
      loadTournaments();
    } catch (error) {
      setCreateError('Failed to create tournament: ' + error.message);
    }
  }, [createTournamentForm, loadTournaments]);

  const handleDeleteTournament = useCallback((tournamentId) => {
    if (window.confirm('Are you sure you want to delete this tournament?')) {
      deleteTournament(tournamentId);
      loadTournaments();
    }
  }, [loadTournaments]);

  const submitTournamentScore = useCallback((username, score, gameTime, moves) => {
    if (!activeTournament) return false;
    
    return addTournamentScore(activeTournament.id, username, score, gameTime, moves);
  }, [activeTournament]);

  const getFormattedTimeLeft = useCallback(() => {
    return formatTournamentTime(tournamentTimeLeft);
  }, [tournamentTimeLeft]);

  const updateCreateForm = useCallback((field, value) => {
    setCreateTournamentForm(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  return {
    activeTournament,
    tournaments,
    tournamentTimeLeft,
    upcomingTournament,
    timeUntilUpcoming,
    showCreateTournament,
    createTournamentForm,
    createError,
    setShowCreateTournament,
    handleCreateTournament,
    handleDeleteTournament,
    submitTournamentScore,
    getFormattedTimeLeft,
    updateCreateForm,
    loadTournaments
  };
}; 