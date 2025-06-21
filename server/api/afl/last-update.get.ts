import { drizzle } from 'drizzle-orm/d1';
import { eq } from 'drizzle-orm';
import { games } from '~/db/schema';

export default defineEventHandler(async (event) => {
  const kv = event.context.cloudflare.env.footykv

  if (!kv) {
    throw createError({
      statusCode: 500,
      statusMessage: "KV store 'footykv' is not available."
    })
  }

  try {
    // Get gameId from query parameters
    const query = getQuery(event);
    const gameId = query.gameId;

    if (!gameId) {
      // If no gameId provided, return general last update time for backward compatibility
      const lastUpdateTime = await kv.get('last_update_time') || '0'
      
      return {
        lastUpdateTime,
        timestamp: Date.now()
      }
    }

    // If gameId is provided, get specific game's last update time
    if (!event.context.cloudflare?.env?.DB) {
      throw createError({
        statusCode: 500,
        statusMessage: "Database binding 'DB' is not available."
      });
    }

    const db = drizzle(event.context.cloudflare.env.DB as any);
    const gameIdNum = parseInt(gameId as string);
    
    if (isNaN(gameIdNum)) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid gameId format'
      });
    }

    // Fetch the game from database to get its apiID
    const gameResult = await db
      .select()
      .from(games)
      .where(eq(games.id, gameIdNum))
      .limit(1);

    if (gameResult.length === 0) {
      throw createError({
        statusCode: 404,
        statusMessage: `Game with ID ${gameId} not found in database`
      });
    }

    const game = gameResult[0];
    const apiID = game.apiID;

    const lastUpdateTime = await kv.get(`last_update_time:${apiID}`) || '0'
    
    return {
      lastUpdateTime,
      timestamp: Date.now(),
      gameId: gameIdNum,
      apiID: apiID
    }
  } catch (error: any) {
    console.error('Error retrieving last update time:', error)
    
    if (error.statusCode) {
      throw error; // Re-throw HTTP errors
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to retrieve last update time'
    })
  }
}) 