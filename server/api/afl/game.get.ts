export default defineEventHandler(async (event) => {
  const kv = event.context.cloudflare.env.footykv;

  if (!kv) {
    throw createError({
      statusCode: 500,
      statusMessage: "KV store 'footykv' is not available."
    });
  }

  try {
    // Get the game details (using the known key structure from the update endpoint)
    const gameKey = 'game:2021:14:StK:WB'; // This matches the data from the example
    const gameDetailsStr = await kv.get(gameKey);
    
    if (!gameDetailsStr) {
      throw createError({
        statusCode: 404,
        statusMessage: "Game data not found"
      });
    }

    const gameDetails = JSON.parse(gameDetailsStr);

    // Get all player keys that start with "player:"
    const playersList = await kv.list({ prefix: 'player:' });
    
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
      away: { players: awayPlayers }
    };
  } catch (error: any) {
    console.error('Error retrieving game data:', error);
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to retrieve game data'
    });
  }
}); 