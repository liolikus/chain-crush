import React from 'react';

const TournamentTimer = ({ activeTournament, timeLeft, formattedTime }) => {
  if (!activeTournament || timeLeft <= 0) return null;

  const now = Date.now();
  const oneMinuteAfterEnd = 60 * 1000; // 1 minute in milliseconds
  const isGracePeriod =
    activeTournament.endDate <= now && activeTournament.endDate + oneMinuteAfterEnd > now;

  const isEndingSoon = timeLeft < 5 * 60 * 1000; // Less than 5 minutes
  const isEndingVerySoon = timeLeft < 60 * 1000; // Less than 1 minute

  return (
    <div className="tournament-timer">
      <div className="tournament-header">
        <h3>🏆 {activeTournament.name}</h3>
        <div className="tournament-status">
          <span className={`status-badge ${isGracePeriod ? 'grace-period' : 'active'}`}>
            {isGracePeriod ? 'ENDING' : 'ACTIVE'}
          </span>
        </div>
      </div>
      <div className="timer-display">
        <div className="timer-label">
          {isGracePeriod ? 'Tournament Ended - Leaderboard Visible For:' : 'Tournament Ends In:'}
        </div>
        <div
          className={`timer-countdown ${
            isEndingVerySoon ? 'urgent' : isEndingSoon ? 'warning' : 'normal'
          }`}
        >
          {formattedTime}
        </div>
      </div>
      <div className="tournament-info">
        <small>
          {isGracePeriod
            ? '🏆 Tournament has ended! Final results will be visible for 1 minute.'
            : '🎮 Each game has 60 seconds. Play multiple games during the tournament!'}
        </small>
      </div>
    </div>
  );
};

export default TournamentTimer;
