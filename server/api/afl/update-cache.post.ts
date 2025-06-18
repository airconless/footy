import type { H3Event } from 'h3';

interface GameDetails {
  locationName: string;
  homeTeamName: string;
  awayTeamName: string;
  homeTeamShort: string;
  awayTeamShort: string;
  percComplete: string;
  round: string;
  year: number;
  homeTeamGoal: string;
  homeTeamBehind: string;
  awayTeamGoal: string;
  awayTeamBehind: string;
  currentQuarter: string;
  currentTime: string;
  lengthSeconds: string;
}

interface Player {
  playerId: string;
  name: string;
  iconImage: string;
  jumperNumber: string;
  kick: string;
  handball: string;
  mark: string;
  hitOut: string;
  tackle: string;
  freeFor: string;
  freeAgainst: string;
  goal: string;
  behind: string;
  aflFantasy: string;
  predictedScore: number;
  tOGPercentage: string;
  eTOG: number;
  eTOGPercentage: number;
  currentBench: string;
  aflFantasyPrice: number;
  aflFantasyTotalPriceChange: number;
  aflFantasyEstimatedPriceChange: number;
  aflFantasyAverage: string;
  aflFantasyBreakEven: string;
  aflFantasyPosition: string;
  selection: string;
  chartData: any; 
  periodScores: any;
  history: any[];
}

interface Team {
  players: Player[];
}

interface AFLData {
  gameDetails: GameDetails;
  home: Team;
  away: Team;
}

export default defineEventHandler(async (event) => {
  const kv = event.context.cloudflare.env.footykv;

  if (!kv) {
    throw new Error("KV store 'footykv' is not available.");
  }

  try {
    const data: AFLData = await $fetch('https://new.dtlive.com.au/storage/games/3214.json');

    const { gameDetails, home, away } = data;

    // Save game details
    const gameKey = `game:${gameDetails.year}:${gameDetails.round}:${gameDetails.homeTeamShort}:${gameDetails.awayTeamShort}`;
    await kv.put(gameKey, JSON.stringify(gameDetails));

    // Save home players with team info
    for (const player of home.players) {
      const playerKey = `player:${player.playerId}`;
      const playerWithTeam = {
        ...player,
        team: 'home',
        teamName: gameDetails.homeTeamName,
        teamShort: gameDetails.homeTeamShort
      };
      await kv.put(playerKey, JSON.stringify(playerWithTeam));
    }

    // Save away players with team info
    for (const player of away.players) {
      const playerKey = `player:${player.playerId}`;
      const playerWithTeam = {
        ...player,
        team: 'away',
        teamName: gameDetails.awayTeamName,
        teamShort: gameDetails.awayTeamShort
      };
      await kv.put(playerKey, JSON.stringify(playerWithTeam));
    }

    return { success: true, message: 'Cache updated successfully.' };
  } catch (error: any) {
    console.error('Error updating cache:', error);
    setResponseStatus(event, 500);
    return { success: false, message: 'Failed to update cache.', error: error.message };
  }
}); 