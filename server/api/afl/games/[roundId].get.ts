import { drizzle } from 'drizzle-orm/d1';
import { eq, and } from 'drizzle-orm';
import { games } from '~/db/schema';

export default defineEventHandler(async (event) => {
  if (!event.context.cloudflare?.env?.DB) {
    throw createError({
      statusCode: 500,
      statusMessage: "Database binding 'DB' is not available."
    });
  }
  
  const db = drizzle(event.context.cloudflare.env.DB as any);
  const roundId = getRouterParam(event, 'roundId'); // Format: "year-round" e.g., "2025-1"

  if (!roundId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Round ID is required'
    });
  }

  try {
    // Parse the roundId to get year and round
    const [year, round] = roundId.split('-').map(Number);
    
    if (!year || !round) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid round ID format. Expected format: "year-round"'
      });
    }

    // Fetch games for the specific round
    const roundGames = await db
      .select()
      .from(games)
      .where(and(
        eq(games.year, year),
        eq(games.round, round)
      ))
      .orderBy(games.date, games.unixtime);

    return {
      success: true,
      roundInfo: {
        year,
        round,
        roundname: roundGames[0]?.roundname || `Round ${round}`,
      },
      games: roundGames.map(game => ({
        id: game.id,
        homeTeam: game.hteam,
        awayTeam: game.ateam,
        homeScore: game.hscore,
        awayScore: game.ascore,
        homeGoals: game.hgoals,
        homeBehinds: game.hbehinds,
        awayGoals: game.agoals,
        awayBehinds: game.abehinds,
        venue: game.venue,
        date: game.date,
        localtime: game.localtime,
        timestr: game.timestr,
        winner: game.winner,
        complete: game.complete,
        is_final: game.is_final,
        is_grand_final: game.is_grand_final,
      }))
    };

  } catch (error: any) {
    console.error(`Error fetching games for round ${roundId}:`, error);
    
    return {
      success: false,
      error: error.message || 'Unknown error occurred',
      games: []
    };
  }
}); 