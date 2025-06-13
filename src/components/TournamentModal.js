import React, { useState } from 'react';

const TournamentModal = ({ showModal, onClose, onCreateTournament }) => {
  const [formData, setFormData] = useState({
    title: '',
    startDate: '',
    endDate: '',
  });
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError(''); // Clear error when user types
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validation
    if (!formData.title.trim()) {
      setError('Tournament title is required');
      return;
    }

    if (!formData.startDate || !formData.endDate) {
      setError('Both start and end dates are required');
      return;
    }

    const startDate = new Date(formData.startDate);
    const endDate = new Date(formData.endDate);
    const now = new Date();

    if (startDate <= now) {
      setError('Start date must be in the future');
      return;
    }

    if (endDate <= startDate) {
      setError('End date must be after start date');
      return;
    }

    // Check minimum duration (at least 1 hour)
    if (endDate - startDate < 60 * 60 * 1000) {
      setError('Tournament must be at least 1 hour long');
      return;
    }

    const success = onCreateTournament(formData);
    if (success) {
      setFormData({ title: '', startDate: '', endDate: '' });
      setError('');
      onClose();
    } else {
      setError('Failed to create tournament. Check for overlapping tournaments.');
    }
  };

  const formatDateTimeLocal = (date) => {
    const d = new Date(date);
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0, 16);
  };

  const getMinDateTime = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() + 30); // Minimum 30 minutes from now
    return formatDateTimeLocal(now);
  };

  if (!showModal) return null;

  return (
    <div className="modal-overlay">
      <div className="modal tournament-modal">
        <div className="modal-header">
          <h2>🏆 Create Tournament</h2>
          <button onClick={onClose} className="close-btn">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="tournament-form">
          <div className="form-group">
            <label htmlFor="title">Tournament Title *</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="Enter tournament title"
              maxLength={50}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="startDate">Start Date & Time *</label>
            <input
              type="datetime-local"
              id="startDate"
              name="startDate"
              value={formData.startDate}
              onChange={handleInputChange}
              min={getMinDateTime()}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="endDate">End Date & Time *</label>
            <input
              type="datetime-local"
              id="endDate"
              name="endDate"
              value={formData.endDate}
              onChange={handleInputChange}
              min={formData.startDate || getMinDateTime()}
              required
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <div className="form-actions">
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              🏆 Create Tournament
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TournamentModal;
