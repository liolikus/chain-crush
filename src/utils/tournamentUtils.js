// Tournament utility functions
const TOURNAMENT_STORAGE_KEY = 'chainCrushTournaments';
const ACTIVE_TOURNAMENT_KEY = 'chainCrushActiveTournament';
const TOURNAMENT_LEADERBOARD_PREFIX = 'chainCrushTournamentLeaderboard_';

export const createTournament = (name, startDate, endDate) => {
  const tournament = {
    id: Date.now().toString(),
    name,
    startDate: new Date(startDate).getTime(),
    endDate: new Date(endDate).getTime(),
    createdAt: Date.now(),
    status: 'scheduled', // scheduled, active, ended
    participants: [],
    leaderboard: []
  };

  const tournaments = getTournaments();
  tournaments.push(tournament);
  localStorage.setItem(TOURNAMENT_STORAGE_KEY, JSON.stringify(tournaments));

  return tournament;
};

export const getTournaments = () => {
  try {
    const tournaments = localStorage.getItem(TOURNAMENT_STORAGE_KEY);
    return tournaments ? JSON.parse(tournaments) : [];
  } catch (error) {
    console.error('Error loading tournaments:', error);
    return [];
  }
};

export const getActiveTournament = () => {
  const tournaments = getTournaments();
  const now = Date.now();
  const oneMinuteAfterEnd = 60 * 1000; // 1 minute in milliseconds
  
  return tournaments.find(tournament => 
    tournament.startDate <= now && 
    (tournament.endDate + oneMinuteAfterEnd) > now
  );
};

export const updateTournamentStatus = () => {
  const tournaments = getTournaments();
  const now = Date.now();
  const oneMinuteAfterEnd = 60 * 1000; // 1 minute in milliseconds
  let hasChanges = false;

  tournaments.forEach(tournament => {
    const oldStatus = tournament.status;
    
    if (tournament.startDate > now) {
      tournament.status = 'scheduled';
    } else if (tournament.startDate <= now && tournament.endDate > now) {
      tournament.status = 'active';
    } else if (tournament.endDate <= now && (tournament.endDate + oneMinuteAfterEnd) > now) {
      // Keep as active during grace period
      tournament.status = 'active';
    } else if ((tournament.endDate + oneMinuteAfterEnd) <= now) {
      tournament.status = 'ended';
    }
    
    if (oldStatus !== tournament.status) {
      console.log(`Tournament ${tournament.name} status changed from ${oldStatus} to ${tournament.status}`);
      hasChanges = true;
    }
  });

  if (hasChanges) {
    localStorage.setItem(TOURNAMENT_STORAGE_KEY, JSON.stringify(tournaments));
  }

  return tournaments;
};

export const forceUpdateTournamentStatuses = () => {
  const tournaments = getTournaments();
  const now = Date.now();
  let hasChanges = false;

  tournaments.forEach(tournament => {
    const oldStatus = tournament.status;
    
    if (tournament.startDate > now) {
      tournament.status = 'scheduled';
    } else if (tournament.startDate <= now && tournament.endDate > now) {
      tournament.status = 'active';
    } else if (tournament.endDate <= now) {
      tournament.status = 'ended';
    }
    
    if (oldStatus !== tournament.status) {
      hasChanges = true;
    }
  });

  if (hasChanges) {
    localStorage.setItem(TOURNAMENT_STORAGE_KEY, JSON.stringify(tournaments));
  }

  return tournaments;
};

export const addTournamentScore = (tournamentId, username, score, gameTime, moves) => {
  const tournaments = getTournaments();
  const tournament = tournaments.find(t => t.id === tournamentId);
  
  if (!tournament) return false;

  const existingEntry = tournament.leaderboard.find(entry => entry.username === username);
  
  if (existingEntry) {
    // Update existing entry with best score
    if (score > existingEntry.score) {
      existingEntry.score = score;
      existingEntry.gameTime = gameTime;
      existingEntry.moves = moves;
      existingEntry.timestamp = Date.now();
    }
  } else {
    // Add new entry
    tournament.leaderboard.push({
      username,
      score,
      gameTime,
      moves,
      timestamp: Date.now()
    });
    
    // Add to participants if not already there
    if (!tournament.participants.includes(username)) {
      tournament.participants.push(username);
    }
  }

  // Sort leaderboard by score (descending)
  tournament.leaderboard.sort((a, b) => b.score - a.score);

  localStorage.setItem(TOURNAMENT_STORAGE_KEY, JSON.stringify(tournaments));
  return true;
};

export const getTournamentLeaderboard = (tournamentId) => {
  const tournaments = getTournaments();
  const tournament = tournaments.find(t => t.id === tournamentId);
  
  return tournament ? tournament.leaderboard : [];
};

export const deleteTournament = (tournamentId) => {
  const tournaments = getTournaments();
  const filteredTournaments = tournaments.filter(t => t.id !== tournamentId);
  localStorage.setItem(TOURNAMENT_STORAGE_KEY, JSON.stringify(filteredTournaments));
};

export const validateTournamentDates = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const now = new Date();
  const minDuration = 2 * 60 * 1000; // 2 minutes in milliseconds
  const maxDuration = 2 * 60 * 60 * 1000; // 2 hours in milliseconds

  if (start <= now) {
    return 'Start date must be in the future';
  }

  if (end <= start) {
    return 'End date must be after start date';
  }

  const duration = end - start;
  if (duration < minDuration) {
    return 'Tournament must be at least 2 minutes long';
  }

  if (duration > maxDuration) {
    return 'Tournament cannot be longer than 2 hours';
  }

  return null;
};

export const formatTournamentTime = (timeLeft) => {
  if (timeLeft <= 0) return '00:00:00';
  
  const hours = Math.floor(timeLeft / (1000 * 60 * 60));
  const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
  
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

export const getClosestUpcomingTournament = () => {
  const tournaments = getTournaments();
  const now = Date.now();
  
  // Find tournaments that haven't started yet
  const upcomingTournaments = tournaments.filter(tournament => 
    tournament.startDate > now && tournament.status === 'scheduled'
  );
  
  if (upcomingTournaments.length === 0) {
    return null;
  }
  
  // Sort by start date and return the closest one
  return upcomingTournaments.sort((a, b) => a.startDate - b.startDate)[0];
};
