import { drizzle } from 'drizzle-orm/d1';
import { eq } from 'drizzle-orm';
import { games } from '~/db/schema';

export default defineEventHandler(async (event) => {
  const kv = event.context.cloudflare.env.footykv;

  if (!kv) {
    throw createError({
      statusCode: 500,
      statusMessage: "KV store 'footykv' is not available."
    });
  }

  if (!event.context.cloudflare?.env?.DB) {
    throw createError({
      statusCode: 500,
      statusMessage: "Database binding 'DB' is not available."
    });
  }

  const db = drizzle(event.context.cloudflare.env.DB as any);

  try {
    // Get gameId from query parameters
    const query = getQuery(event);
    const gameId = query.gameId;

    if (!gameId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'gameId parameter is required'
      });
    }

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

    // Get the game details using apiID
    const gameKey = `game:${apiID}`;
    const gameDetailsStr = await kv.get(gameKey);
    
    if (!gameDetailsStr) {
      throw createError({
        statusCode: 404,
        statusMessage: `Game data not found for game ${gameId} (apiID: ${apiID}). Try updating the cache first.`
      });
    }

    const gameDetails = JSON.parse(gameDetailsStr);

    // Get all player keys for this specific game
    const playersList = await kv.list({ prefix: `player:${apiID}:` });
    
    const homePlayers = [];
    const awayPlayers = [];
    
    for (const key of playersList.keys) {
      const playerData = await kv.get(key.name);
      if (playerData) {
        const player = JSON.parse(playerData);
        if (player.team === 'home') {
          homePlayers.push(player);
        } else if (player.team === 'away') {
          awayPlayers.push(player);
        }
      }
    }

    return {
      gameDetails,
      home: { players: homePlayers },
      away: { players: awayPlayers },
      gameId: gameIdNum,
      apiID: apiID
    };
  } catch (error: any) {
    console.error('Error retrieving game data:', error);
    
    if (error.statusCode) {
      throw error; // Re-throw HTTP errors
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to retrieve game data'
    });
  }
}); 