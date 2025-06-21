import { drizzle } from 'drizzle-orm/d1';
import { eq } from 'drizzle-orm';
import { games } from '~/db/schema';

export default defineEventHandler(async (event) => {
  if (!event.context.cloudflare?.env?.DB) {
    throw createError({
      statusCode: 500,
      statusMessage: "Database binding 'DB' is not available."
    });
  }
  
  const db = drizzle(event.context.cloudflare.env.DB as any);
  const gameId = getRouterParam(event, 'gameId');

  if (!gameId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Game ID is required'
    });
  }

  try {
    const gameIdNum = parseInt(gameId);
    
    if (isNaN(gameIdNum)) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid game ID format'
      });
    }

    // Fetch the specific game
    const gameResult = await db
      .select()
      .from(games)
      .where(eq(games.id, gameIdNum))
      .limit(1);

    if (gameResult.length === 0) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Game not found'
      });
    }

    const game = gameResult[0];

    return {
      success: true,
      game: {
        id: game.id,
        apiID: game.apiID,
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
        roundname: game.roundname,
        year: game.year,
        round: game.round,
        hteamid: game.hteamid,
        ateamid: game.ateamid,
        tz: game.tz,
        unixtime: game.unixtime,
        updated: game.updated,
        winnerteamid: game.winnerteamid,
      }
    };

  } catch (error: any) {
    console.error(`Error fetching game ${gameId}:`, error);
    
    if (error.statusCode) {
      throw error; // Re-throw HTTP errors
    }
    
    return {
      success: false,
      error: error.message || 'Unknown error occurred',
      game: null
    };
  }
}); 