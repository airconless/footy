import { drizzle } from 'drizzle-orm/d1';
import { eq, and, lte, gte, desc } from 'drizzle-orm';
import { games } from '~/db/schema';

export default defineEventHandler(async (event) => {
  if (!event.context.cloudflare?.env?.DB) {
    throw createError({
      statusCode: 500,
      statusMessage: "Database binding 'DB' is not available."
    });
  }
  
  const db = drizzle(event.context.cloudflare.env.DB as any);

  try {
    // Get current time
    const currentUnixTime = Math.floor(Date.now() / 1000);
    
    // First, try to find a round that has games currently happening
    const activeGames = await db
      .select({
        year: games.year,
        round: games.round,
        roundname: games.roundname
      })
      .from(games)
      .where(and(
        gte(games.unixtime, currentUnixTime - (3 * 60 * 60)), // Games that started up to 3 hours ago
        lte(games.unixtime, currentUnixTime + (60 * 60)) // Games starting within 1 hour
      ))
      .groupBy(games.year, games.round, games.roundname)
      .orderBy(desc(games.year), desc(games.round))
      .limit(1);

    if (activeGames.length > 0) {
      const currentRound = activeGames[0];
      return {
        success: true,
        currentRound: {
          year: currentRound.year,
          round: currentRound.round,
          roundname: currentRound.roundname,
          value: `${currentRound.year}-${currentRound.round}`,
          source: 'active_games'
        }
      };
    }

    // If no active games, find the most recent round
    const latestRound = await db
      .select({
        year: games.year,
        round: games.round,
        roundname: games.roundname
      })
      .from(games)
      .where(lte(games.unixtime, currentUnixTime + (7 * 24 * 60 * 60))) // Games within next week
      .groupBy(games.year, games.round, games.roundname)
      .orderBy(desc(games.year), desc(games.round))
      .limit(1);

    if (latestRound.length > 0) {
      const currentRound = latestRound[0];
      return {
        success: true,
        currentRound: {
          year: currentRound.year,
          round: currentRound.round,
          roundname: currentRound.roundname,
          value: `${currentRound.year}-${currentRound.round}`,
          source: 'latest_round'
        }
      };
    }

    // Fallback to current season Round 1
    const currentYear = new Date().getFullYear();
    return {
      success: true,
      currentRound: {
        year: currentYear,
        round: 1,
        roundname: 'Round 1',
        value: `${currentYear}-1`,
        source: 'fallback'
      }
    };

  } catch (error: any) {
    console.error('Error getting current round:', error);
    
    return {
      success: false,
      error: error.message || 'Unknown error occurred',
      currentRound: null
    };
  }
}); 