// Tournament management utilities
export const createTournament = (tournamentData, currentUser, setCurrentUser) => {
  if (!currentUser?.isAdmin) {
    console.error('Only admins can create tournaments');
    return false;
  }

  const tournament = {
    id: Date.now().toString(),
    title: tournamentData.title,
    startDate: new Date(tournamentData.startDate),
    endDate: new Date(tournamentData.endDate),
    status: 'scheduled', // scheduled, active, completed
    participants: [],
    leaderboard: [],
    createdBy: currentUser.username,
    createdAt: new Date(),
  };

  // Validate tournament dates
  const now = new Date();
  if (tournament.startDate <= now) {
    console.error('Tournament start date must be in the future');
    return false;
  }

  if (tournament.endDate <= tournament.startDate) {
    console.error('Tournament end date must be after start date');
    return false;
  }

  // Get existing tournaments
  const existingTournaments = JSON.parse(localStorage.getItem('tournaments') || '[]');

  // Check for overlapping tournaments
  const hasOverlap = existingTournaments.some(
    (t) =>
      t.status !== 'completed' &&
      ((tournament.startDate >= new Date(t.startDate) &&
        tournament.startDate < new Date(t.endDate)) ||
        (tournament.endDate > new Date(t.startDate) && tournament.endDate <= new Date(t.endDate)) ||
        (tournament.startDate <= new Date(t.startDate) &&
          tournament.endDate >= new Date(t.endDate)))
  );

  if (hasOverlap) {
    console.error('Tournament overlaps with existing tournament');
    return false;
  }

  // Add new tournament
  existingTournaments.push(tournament);
  localStorage.setItem('tournaments', JSON.stringify(existingTournaments));

  return true;
};

export const getTournaments = () => {
  return JSON.parse(localStorage.getItem('tournaments') || '[]');
};

export const getActiveTournament = () => {
  const tournaments = getTournaments();
  const now = new Date();

  return tournaments.find(
    (t) => new Date(t.startDate) <= now && new Date(t.endDate) > now && t.status === 'active'
  );
};

export const getUpcomingTournament = () => {
  const tournaments = getTournaments();
  const now = new Date();

  return tournaments
    .filter((t) => new Date(t.startDate) > now && t.status === 'scheduled')
    .sort((a, b) => new Date(a.startDate) - new Date(b.startDate))[0];
};

export const updateTournamentStatus = () => {
  const tournaments = getTournaments();
  const now = new Date();
  let updated = false;

  tournaments.forEach((tournament) => {
    const startDate = new Date(tournament.startDate);
    const endDate = new Date(tournament.endDate);

    if (tournament.status === 'scheduled' && startDate <= now && endDate > now) {
      tournament.status = 'active';
      updated = true;

      // Clear leaderboard when tournament starts
      localStorage.removeItem('leaderboard');
      console.log(`Tournament "${tournament.title}" has started!`);
    } else if (tournament.status === 'active' && endDate <= now) {
      tournament.status = 'completed';
      updated = true;
      console.log(`Tournament "${tournament.title}" has ended!`);
    }
  });

  if (updated) {
    localStorage.setItem('tournaments', JSON.stringify(tournaments));
  }

  return updated;
};

export const addTournamentParticipant = (tournamentId, username) => {
  const tournaments = getTournaments();
  const tournament = tournaments.find((t) => t.id === tournamentId);

  if (tournament && !tournament.participants.includes(username)) {
    tournament.participants.push(username);
    localStorage.setItem('tournaments', JSON.stringify(tournaments));
  }
};

export const updateTournamentScore = (username, score, gameTime, moves) => {
  const activeTournament = getActiveTournament();
  if (!activeTournament) return;

  const tournaments = getTournaments();
  const tournament = tournaments.find((t) => t.id === activeTournament.id);

  if (tournament) {
    // Add participant if not already added
    if (!tournament.participants.includes(username)) {
      tournament.participants.push(username);
    }

    // Update tournament leaderboard
    const existingEntry = tournament.leaderboard.find((entry) => entry.username === username);
    const newEntry = {
      username,
      score,
      gameTime,
      moves,
      timestamp: new Date().toISOString(),
    };

    if (existingEntry) {
      if (score > existingEntry.score) {
        Object.assign(existingEntry, newEntry);
      }
    } else {
      tournament.leaderboard.push(newEntry);
    }

    // Sort leaderboard by score
    tournament.leaderboard.sort((a, b) => b.score - a.score);

    localStorage.setItem('tournaments', JSON.stringify(tournaments));
  }
};

export const deleteTournament = (tournamentId, currentUser) => {
  if (!currentUser?.isAdmin) {
    console.error('Only admins can delete tournaments');
    return false;
  }

  const tournaments = getTournaments();
  const filteredTournaments = tournaments.filter((t) => t.id !== tournamentId);
  localStorage.setItem('tournaments', JSON.stringify(filteredTournaments));
  return true;
};
