import React, { useState } from 'react';

import {
  validateTournament,
  createTournament,
  getTournamentStatus,
} from '../utils/tournamentUtils';

const TournamentManager = ({ isAdmin, onCreateTournament, activeTournament, tournaments = [] }) => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showTournamentList, setShowTournamentList] = useState(false);
  const [tournamentForm, setTournamentForm] = useState({
    name: '',
    startDate: '',
    endDate: '',
  });
  const [errors, setErrors] = useState([]);

  const upcomingTournaments = tournaments.filter((t) => getTournamentStatus(t) === 'upcoming');
  const completedTournaments = tournaments.filter((t) => getTournamentStatus(t) === 'completed');

  const handleCreateTournament = (e) => {
    e.preventDefault();

    const validation = validateTournament(tournamentForm);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    const tournament = createTournament(tournamentForm);
    onCreateTournament(tournament);
    setShowCreateForm(false);
    setTournamentForm({ name: '', startDate: '', endDate: '' });
    setErrors([]);
  };

  const handleInputChange = (field, value) => {
    setTournamentForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const getTournamentDuration = (tournament) => {
    const duration = new Date(tournament.endDate) - new Date(tournament.startDate);
    const minutes = Math.floor(duration / (1000 * 60));
    return `${minutes} min`;
  };

  if (!isAdmin) return null;

  return (
    <div className="tournament-manager admin-section">
      <h4>🏟️ Tournament Management</h4>

      {activeTournament && (
        <div className="active-tournament admin-info">
          <strong>🔥 Active: {activeTournament.name}</strong>
          <span>Ends: {formatDateTime(activeTournament.endDate)}</span>
          <span>Participants: {activeTournament.participants?.length || 0}</span>
        </div>
      )}

      <div className="admin-actions">
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="admin-btn create-tournament-btn"
        >
          ➕ Create Tournament
        </button>
        <button
          onClick={() => setShowTournamentList(!showTournamentList)}
          className="admin-btn list-tournaments-btn"
        >
          📋 Tournament List ({tournaments.length})
        </button>
      </div>

      {showCreateForm && (
        <form onSubmit={handleCreateTournament} className="tournament-form admin-form">
          <div className="form-group">
            <label>Tournament Name:</label>
            <input
              type="text"
              value={tournamentForm.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Enter tournament name"
              required
            />
          </div>

          <div className="form-group">
            <label>Start Date & Time:</label>
            <input
              type="datetime-local"
              value={tournamentForm.startDate}
              onChange={(e) => handleInputChange('startDate', e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>End Date & Time:</label>
            <input
              type="datetime-local"
              value={tournamentForm.endDate}
              onChange={(e) => handleInputChange('endDate', e.target.value)}
              required
            />
          </div>

          {errors.length > 0 && (
            <div className="tournament-errors">
              {errors.map((error, index) => (
                <p key={index} className="error">
                  {error}
                </p>
              ))}
            </div>
          )}

          <div className="form-actions">
            <button type="submit" className="admin-btn">
              ✅ Create Tournament
            </button>
            <button
              type="button"
              onClick={() => setShowCreateForm(false)}
              className="admin-btn cancel"
            >
              ❌ Cancel
            </button>
          </div>
        </form>
      )}

      {showTournamentList && (
        <div className="tournament-list admin-form">
          <div className="tournament-list-header">
            <h5>📋 All Tournaments</h5>
            <button onClick={() => setShowTournamentList(false)} className="close-btn">
              ✕
            </button>
          </div>

          {/* Upcoming Tournaments */}
          {upcomingTournaments.length > 0 && (
            <div className="tournament-section">
              <h6>⏰ Upcoming Tournaments ({upcomingTournaments.length})</h6>
              <div className="tournament-items">
                {upcomingTournaments.map((tournament) => (
                  <div key={tournament.id} className="tournament-item upcoming">
                    <div className="tournament-info">
                      <strong>{tournament.name}</strong>
                      <span className="tournament-status">🟡 Upcoming</span>
                    </div>
                    <div className="tournament-details">
                      <span>📅 Starts: {formatDateTime(tournament.startDate)}</span>
                      <span>⏱️ Duration: {getTournamentDuration(tournament)}</span>
                      <span>👥 Participants: {tournament.participants?.length || 0}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Active Tournament */}
          {activeTournament && (
            <div className="tournament-section">
              <h6>🔥 Active Tournament</h6>
              <div className="tournament-items">
                <div className="tournament-item active">
                  <div className="tournament-info">
                    <strong>{activeTournament.name}</strong>
                    <span className="tournament-status">🟢 Active</span>
                  </div>
                  <div className="tournament-details">
                    <span>⏰ Ends: {formatDateTime(activeTournament.endDate)}</span>
                    <span>👥 Participants: {activeTournament.participants?.length || 0}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Completed Tournaments */}
          {completedTournaments.length > 0 && (
            <div className="tournament-section">
              <h6>✅ Completed Tournaments ({completedTournaments.length})</h6>
              <div className="tournament-items">
                {completedTournaments.slice(0, 5).map((tournament) => (
                  <div key={tournament.id} className="tournament-item completed">
                    <div className="tournament-info">
                      <strong>{tournament.name}</strong>
                      <span className="tournament-status">⚫ Completed</span>
                    </div>
                    <div className="tournament-details">
                      <span>📅 Ended: {formatDateTime(tournament.endDate)}</span>
                      <span>⏱️ Duration: {getTournamentDuration(tournament)}</span>
                      <span>👥 Participants: {tournament.participants?.length || 0}</span>
                    </div>
                  </div>
                ))}
                {completedTournaments.length > 5 && (
                  <div className="tournament-item-more">
                    <span>
                      ... and {completedTournaments.length - 5} more completed tournaments
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {tournaments.length === 0 && (
            <div className="no-tournaments">
              <p>📝 No tournaments created yet</p>
              <p>
                <small>Create your first tournament to get started!</small>
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TournamentManager;
