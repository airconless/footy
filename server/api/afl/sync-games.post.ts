import { drizzle } from 'drizzle-orm/d1';
import { desc, eq } from 'drizzle-orm';
import { games } from '~/db/schema';

interface SquiggleGame {
  id: number;
  hteam: string;
  ateam: string;
  hteamid: number;
  ateamid: number;
  year: number;
  round: number;
  roundname: string;
  venue: string;
  date: string;
  localtime: string;
  tz: string;
  unixtime: number;
  timestr: string;
  updated: string;
  hscore: number;
  ascore: number;
  hgoals: number;
  hbehinds: number;
  agoals: number;
  abehinds: number;
  winner: string | null;
  winnerteamid: number | null;
  complete: number;
  is_final: number;
  is_grand_final: number;
}

interface SquiggleResponse {
  games: SquiggleGame[];
}

export default defineEventHandler(async (event) => {
  if (!event.context.cloudflare?.env?.DB) {
    throw createError({
      statusCode: 500,
      statusMessage: "Database binding 'DB' is not available."
    });
  }
  
  const db = drizzle(event.context.cloudflare.env.DB);

  try {
    console.log('Fetching games data from Squiggle API...');
    
    // Fetch data from Squiggle API
    const response = await $fetch<SquiggleResponse>('https://api.squiggle.com.au/?q=games;year=2025', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; AFL-App/1.0)',
        'Accept': 'application/json',
      },
      timeout: 15000, // 15 second timeout
    });

    if (!response || !response.games) {
      throw new Error('Invalid response from Squiggle API');
    }

    console.log(`Found ${response.games.length} games to process`);

    // Get the current highest apiID to determine the next one
    const lastRecord = await db
      .select({ apiID: games.apiID })
      .from(games)
      .orderBy(desc(games.apiID))
      .limit(1);

    let nextApiID = lastRecord.length > 0 ? (lastRecord[0].apiID || 3100) + 1 : 3101;

    const insertedGames = [];
    const updatedGames = [];
    const skippedGames = [];

    for (const gameData of response.games) {
      try {
        // Check if game already exists by Squiggle ID
        const existingGame = await db
          .select()
          .from(games)
          .where(eq(games.id, gameData.id))
          .limit(1);

        if (existingGame.length > 0) {
          // Update existing game
          await db
            .update(games)
            .set({
              hteam: gameData.hteam,
              ateam: gameData.ateam,
              year: gameData.year,
              round: gameData.round,
              roundname: gameData.roundname,
              venue: gameData.venue,
              date: gameData.date,
              localtime: gameData.localtime,
              tz: gameData.tz,
              unixtime: gameData.unixtime,
              timestr: gameData.timestr,
              updated: gameData.updated,
              hscore: gameData.hscore || 0,
              ascore: gameData.ascore || 0,
              hgoals: gameData.hgoals || 0,
              hbehinds: gameData.hbehinds || 0,
              agoals: gameData.agoals || 0,
              abehinds: gameData.abehinds || 0,
              winner: gameData.winner || null,
              winnerteamid: gameData.winnerteamid || null,
              complete: gameData.complete,
              is_final: gameData.is_final,
              is_grand_final: gameData.is_grand_final,
            })
            .where(eq(games.id, gameData.id));

          updatedGames.push(gameData.id);
        } else {
          // Insert new game
          await db.insert(games).values({
            id: gameData.id,
            apiID: nextApiID,
            hteam: gameData.hteam,
            ateam: gameData.ateam,
            hteamid: gameData.hteamid,
            ateamid: gameData.ateamid,
            year: gameData.year,
            round: gameData.round,
            roundname: gameData.roundname,
            venue: gameData.venue,
            date: gameData.date,
            localtime: gameData.localtime,
            tz: gameData.tz,
            unixtime: gameData.unixtime,
            timestr: gameData.timestr,
            updated: gameData.updated,
            hscore: gameData.hscore || 0,
            ascore: gameData.ascore || 0,
            hgoals: gameData.hgoals || 0,
            hbehinds: gameData.hbehinds || 0,
            agoals: gameData.agoals || 0,
            abehinds: gameData.abehinds || 0,
            winner: gameData.winner || null,
            winnerteamid: gameData.winnerteamid || null,
            complete: gameData.complete,
            is_final: gameData.is_final,
            is_grand_final: gameData.is_grand_final,
          });

          insertedGames.push({ id: gameData.id, apiID: nextApiID });
          nextApiID++;
        }
      } catch (gameError: any) {
        console.error(`Error processing game ${gameData.id}:`, gameError.message);
        skippedGames.push({ id: gameData.id, error: gameError.message });
      }
    }

    const summary = {
      total: response.games.length,
      inserted: insertedGames.length,
      updated: updatedGames.length,
      skipped: skippedGames.length,
      nextApiID: nextApiID,
    };

    console.log('Sync completed:', summary);

    return {
      success: true,
      message: 'Games data synchronized successfully',
      summary,
      insertedGames: insertedGames.slice(0, 5), // Show first 5 for brevity
      updatedGames: updatedGames.slice(0, 5),
      skippedGames,
    };

  } catch (error: any) {
    console.error('Error syncing games data:', error);
    
    return {
      success: false,
      error: error.message || 'Unknown error occurred',
      timestamp: new Date().toISOString(),
    };
  }
}); 