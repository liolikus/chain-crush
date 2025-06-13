import React, { useState, useEffect } from 'react';
import { getTournaments, deleteTournament } from '../utils/tournamentUtils';

const TournamentManagement = ({ currentUser, onCreateTournament }) => {
  const [tournaments, setTournaments] = useState([]);

  useEffect(() => {
    setTournaments(getTournaments());
  }, []);

  const handleDeleteTournament = (tournamentId) => {
    if (window.confirm('Are you sure you want to delete this tournament?')) {
      const success = deleteTournament(tournamentId, currentUser);
      if (success) {
        setTournaments(getTournaments());
      }
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return '#4CAF50';
      case 'scheduled':
        return '#FF9800';
      case 'completed':
        return '#757575';
      default:
        return '#757575';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active':
        return '🔴';
      case 'scheduled':
        return '📅';
      case 'completed':
        return '✅';
      default:
        return '❓';
    }
  };

  return (
    <div className="tournament-management">
      <div className="management-header">
        <h3>🏆 Tournament Management</h3>
        <button onClick={onCreateTournament} className="btn-primary">
          ➕ Create Tournament
        </button>
      </div>

      {tournaments.length === 0 ? (
        <div className="no-tournaments">
          <p>No tournaments created yet</p>
          <button onClick={onCreateTournament} className="btn-secondary">
            Create Your First Tournament
          </button>
        </div>
      ) : (
        <div className="tournaments-list">
          {tournaments
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .map((tournament) => (
              <div key={tournament.id} className="tournament-card">
                <div className="tournament-card-header">
                  <div className="tournament-title">
                    <span className="status-icon">{getStatusIcon(tournament.status)}</span>
                    <h4>{tournament.title}</h4>
                    <span
                      className="status-badge"
                      style={{ backgroundColor: getStatusColor(tournament.status) }}
                    >
                      {tournament.status.toUpperCase()}
                    </span>
                  </div>
                  <button
                    onClick={() => handleDeleteTournament(tournament.id)}
                    className="delete-btn"
                    title="Delete Tournament"
                  >
                    🗑️
                  </button>
                </div>

                <div className="tournament-details">
                  <div className="detail-row">
                    <span className="label">Start:</span>
                    <span>{formatDate(tournament.startDate)}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">End:</span>
                    <span>{formatDate(tournament.endDate)}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Participants:</span>
                    <span>{tournament.participants?.length || 0}</span>
                  </div>
                  {tournament.status === 'completed' && tournament.leaderboard?.length > 0 && (
                    <div className="detail-row">
                      <span className="label">Winner:</span>
                      <span>
                        🏆 {tournament.leaderboard[0].username} ({tournament.leaderboard[0].score}{' '}
                        pts)
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
};

export default TournamentManagement;
