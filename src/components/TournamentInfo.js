import React, { useState, useEffect } from 'react';
import { getActiveTournament, getUpcomingTournament } from '../utils/tournamentUtils';

const TournamentInfo = () => {
  const [activeTournament, setActiveTournament] = useState(null);
  const [upcomingTournament, setUpcomingTournament] = useState(null);
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    const updateTournamentInfo = () => {
      setActiveTournament(getActiveTournament());
      setUpcomingTournament(getUpcomingTournament());
    };

    updateTournamentInfo();
    const interval = setInterval(updateTournamentInfo, 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const updateCountdown = () => {
      const tournament = activeTournament || upcomingTournament;
      if (!tournament) {
        setTimeLeft('');
        return;
      }

      const targetDate = activeTournament
        ? new Date(tournament.endDate)
        : new Date(tournament.startDate);

      const now = new Date();
      const difference = targetDate - now;

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        if (days > 0) {
          setTimeLeft(`${days}d ${hours}h ${minutes}m`);
        } else if (hours > 0) {
          setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
        } else {
          setTimeLeft(`${minutes}m ${seconds}s`);
        }
      } else {
        setTimeLeft('');
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [activeTournament, upcomingTournament]);

  if (!activeTournament && !upcomingTournament) {
    return null;
  }

  const tournament = activeTournament || upcomingTournament;
  const isActive = !!activeTournament;

  return (
    <div className={`tournament-info ${isActive ? 'active' : 'upcoming'}`}>
      <div className="tournament-header">
        <span className="tournament-icon">{isActive ? '🏆' : '⏰'}</span>
        <div className="tournament-details">
          <h3>{tournament.title}</h3>
          <div className="tournament-status">
            {isActive ? (
              <span className="status-active">🔴 LIVE - Ends in {timeLeft}</span>
            ) : (
              <span className="status-upcoming">📅 Starts in {timeLeft}</span>
            )}
          </div>
        </div>
      </div>

      <div className="tournament-meta">
        <small>
          {isActive ? 'Tournament Active' : 'Next Tournament'} •
          {tournament.participants?.length || 0} participants
        </small>
      </div>
    </div>
  );
};

export default TournamentInfo;
