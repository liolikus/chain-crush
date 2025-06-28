import React from 'react';
import { getTournamentLeaderboard } from '../utils/tournamentUtils';

const TournamentManager = ({
  tournaments,
  showCreateTournament,
  createTournamentForm,
  createError,
  onShowCreate,
  onHideCreate,
  onCreateTournament,
  onDeleteTournament,
  onUpdateForm
}) => {
  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };

  const getStatusBadge = (tournament) => {
    const now = Date.now();
    const oneMinuteAfterEnd = 60 * 1000; // 1 minute in milliseconds
    
    if ((tournament.endDate + oneMinuteAfterEnd) <= now) {
      return <span className="status-badge ended">ENDED</span>;
    } else if (tournament.startDate > now) {
      return <span className="status-badge scheduled">SCHEDULED</span>;
    } else if (tournament.endDate <= now && (tournament.endDate + oneMinuteAfterEnd) > now) {
      return <span className="status-badge grace-period">ENDING</span>;
    } else {
      return <span className="status-badge active">ACTIVE</span>;
    }
  };

  const handleDeleteTournament = (tournament) => {
    const now = Date.now();
    const isActive = tournament.startDate <= now && tournament.endDate > now;
    
    if (isActive) {
      alert('Cannot delete an active tournament. Please wait for it to end.');
      return;
    }
    
    const confirmMessage = tournament.status === 'ended' 
      ? `Are you sure you want to delete the ended tournament "${tournament.name}"? This will permanently remove all tournament data.`
      : `Are you sure you want to delete the scheduled tournament "${tournament.name}"?`;
    
    if (window.confirm(confirmMessage)) {
      onDeleteTournament(tournament.id);
    }
  };

  const handleClearEndedTournaments = () => {
    const endedTournaments = tournaments.filter(t => t.endDate <= Date.now());
    
    if (endedTournaments.length === 0) {
      alert('No ended tournaments to clear.');
      return;
    }
    
    const confirmMessage = `Are you sure you want to delete all ${endedTournaments.length} ended tournaments? This will permanently remove all tournament data.`;
    
    if (window.confirm(confirmMessage)) {
      endedTournaments.forEach(tournament => {
        onDeleteTournament(tournament.id);
      });
    }
  };

  const endedTournamentsCount = tournaments.filter(t => t.endDate <= Date.now()).length;

  return (
    <div className="tournament-manager">
      <div className="tournament-header">
        <h3>🏆 Tournament Management</h3>
        <div className="tournament-header-actions">
          <button onClick={onShowCreate} className="admin-btn primary">
            ➕ Create Tournament
          </button>
          {endedTournamentsCount > 0 && (
            <button onClick={handleClearEndedTournaments} className="admin-btn danger">
              🗑️ Clear Ended ({endedTournamentsCount})
            </button>
          )}
        </div>
      </div>

      {showCreateTournament && (
        <div className="create-tournament-form">
          <h4>Create New Tournament</h4>
          <form onSubmit={onCreateTournament}>
            <div className="form-group">
              <label>Tournament Name:</label>
              <input
                type="text"
                value={createTournamentForm.name}
                onChange={(e) => onUpdateForm('name', e.target.value)}
                placeholder="Enter tournament name"
                required
              />
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label>Start Date:</label>
                <input
                  type="date"
                  value={createTournamentForm.startDate}
                  onChange={(e) => onUpdateForm('startDate', e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>Start Time:</label>
                <input
                  type="time"
                  value={createTournamentForm.startTime}
                  onChange={(e) => onUpdateForm('startTime', e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>End Date:</label>
                <input
                  type="date"
                  value={createTournamentForm.endDate}
                  onChange={(e) => onUpdateForm('endDate', e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>End Time:</label>
                <input
                  type="time"
                  value={createTournamentForm.endTime}
                  onChange={(e) => onUpdateForm('endTime', e.target.value)}
                  required
                />
              </div>
            </div>

            {createError && <div className="error-message">{createError}</div>}

            <div className="form-actions">
              <button type="submit" className="admin-btn primary">
                Create Tournament
              </button>
              <button type="button" onClick={onHideCreate} className="admin-btn secondary">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="tournaments-list">
        <h4>Tournaments ({tournaments.length})</h4>
        {tournaments.length === 0 ? (
          <p className="no-tournaments">No tournaments created yet.</p>
        ) : (
          <div className="tournaments-grid scrollable">
            {tournaments.map((tournament) => (
              <div key={tournament.id} className="tournament-card">
                <div className="tournament-card-header">
                  <h5>{tournament.name}</h5>
                  {getStatusBadge(tournament)}
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
                    <span>{tournament.participants.length}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Games:</span>
                    <span>{tournament.leaderboard.length}</span>
                  </div>
                </div>

                {tournament.status === 'ended' && tournament.leaderboard.length > 0 && (
                  <div className="tournament-results">
                    <h6>Top 25 Results:</h6>
                    <div className="results-list">
                      {tournament.leaderboard.slice(0, 25).map((entry, index) => (
                        <div key={index} className="result-entry">
                          <span className="rank">#{index + 1}</span>
                          <span className="player">{entry.username}</span>
                          <span className="score">{entry.score} pts</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="tournament-actions">
                  <button
                    onClick={() => handleDeleteTournament(tournament)}
                    className="admin-btn danger small"
                    title={tournament.startDate <= Date.now() && tournament.endDate > Date.now() 
                      ? "Cannot delete active tournament" 
                      : "Delete tournament"
                    }
                    disabled={tournament.startDate <= Date.now() && tournament.endDate > Date.now()}
                  >
                    🗑️ Delete
                  </button>
                  {tournament.status === 'ended' && (
                    <button
                      onClick={() => {
                        const leaderboard = getTournamentLeaderboard(tournament.id);
                        console.log(`${tournament.name} Leaderboard:`, leaderboard);
                        alert(`${tournament.name} leaderboard has ${leaderboard.length} entries. Check console for details.`);
                      }}
                      className="admin-btn secondary small"
                    >
                      📊 View Results
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TournamentManager; 