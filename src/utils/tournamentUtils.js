// Tournament validation and management utilities
export const TOURNAMENT_CONSTRAINTS = {
  MIN_DURATION: 2 * 60 * 1000, // 2 minutes in milliseconds
  MAX_DURATION: 60 * 60 * 1000, // 1 hour in milliseconds
  MIN_NAME_LENGTH: 3,
  MAX_NAME_LENGTH: 50,
};

export const validateTournament = (tournament) => {
  const { name, startDate, endDate } = tournament;
  const duration = new Date(endDate) - new Date(startDate);

  const errors = [];

  if (!name || name.length < TOURNAMENT_CONSTRAINTS.MIN_NAME_LENGTH) {
    errors.push('Tournament name must be at least 3 characters');
  }

  if (duration < TOURNAMENT_CONSTRAINTS.MIN_DURATION) {
    errors.push('Tournament must last at least 2 minutes');
  }

  if (duration > TOURNAMENT_CONSTRAINTS.MAX_DURATION) {
    errors.push('Tournament cannot last more than 1 hour');
  }

  if (new Date(startDate) <= new Date()) {
    errors.push('Tournament must start in the future');
  }

  return { isValid: errors.length === 0, errors };
};

export const getTournamentStatus = (tournament) => {
  const now = new Date();
  const start = new Date(tournament.startDate);
  const end = new Date(tournament.endDate);

  if (now < start) return 'upcoming';
  if (now >= start && now <= end) return 'active';
  return 'completed';
};

export const createTournament = (tournamentData) => {
  return {
    id: Date.now().toString(),
    ...tournamentData,
    createdAt: new Date().toISOString(),
    participants: [],
    leaderboard: [],
  };
};

export const joinTournament = (tournamentId, playerId) => {
  // Future implementation for tournament joining
  console.log(`Player ${playerId} joining tournament ${tournamentId}`);
};

export const getTournamentLeaderboard = (tournamentId) => {
  // Future implementation for tournament-specific leaderboards
  return [];
};
