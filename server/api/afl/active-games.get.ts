import { drizzle } from 'drizzle-orm/d1';
import { and, gte, lte } from 'drizzle-orm';
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
    // Calculate time window (same logic as update-cache)
    const currentUnixTime = Math.floor(Date.now() / 1000);
    // Find games where current time is within [game_start - 1min, game_start + 200min]
    // This means: game_start >= current_time - 200min AND game_start <= current_time + 1min
    const earliestGameStart = currentUnixTime - (200 * 60); // Games that started up to 200 minutes ago
    const latestGameStart = currentUnixTime + 60; // Games starting up to 1 minute from now

    console.log(`Looking for active games between ${earliestGameStart} and ${latestGameStart} (current: ${currentUnixTime})`);

    // Find games within the time window
    const activeGames = await db
      .select()
      .from(games)
      .where(and(
        gte(games.unixtime, earliestGameStart),
        lte(games.unixtime, latestGameStart)
      ));

    // Format the response with readable dates
    const formattedGames = activeGames.map(game => ({
      id: game.id,
      apiID: game.apiID,
      homeTeam: game.hteam,
      awayTeam: game.ateam,
      venue: game.venue,
      date: game.date,
      localtime: game.localtime,
      unixtime: game.unixtime,
      readableTime: game.unixtime ? new Date(game.unixtime * 1000).toLocaleString() : 'Unknown',
      timestr: game.timestr,
      complete: game.complete,
      round: game.round,
      roundname: game.roundname
    }));

    return {
      success: true,
      currentUnixTime,
      timeWindow: {
        start: earliestGameStart,
        end: latestGameStart,
        startReadable: new Date(earliestGameStart * 1000).toLocaleString(),
        endReadable: new Date(latestGameStart * 1000).toLocaleString(),
        currentReadable: new Date(currentUnixTime * 1000).toLocaleString()
      },
      activeGamesCount: activeGames.length,
      activeGames: formattedGames
    };

  } catch (error: any) {
    console.error('Error fetching active games:', error);
    
    return {
      success: false,
      error: error.message || 'Unknown error occurred'
    };
  }
}); 