import type { H3Event } from 'h3';
import { drizzle } from 'drizzle-orm/d1';
import { eq, and, gte, lte } from 'drizzle-orm';
import { games } from '~/db/schema';

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

// Helper function to add delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// User agent rotation for better anonymity
const userAgents = [
  // Chrome - Windows
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 11.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
  
  // Chrome - macOS
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 13_6_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
  
  // Chrome - Linux
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
  
  // Firefox - Windows
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:120.0) Gecko/20100101 Firefox/120.0',
  'Mozilla/5.0 (Windows NT 10.0; rv:121.0) Gecko/20100101 Firefox/121.0',
  
  // Firefox - macOS
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:121.0) Gecko/20100101 Firefox/121.0',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.14; rv:120.0) Gecko/20100101 Firefox/120.0',
  
  // Firefox - Linux
  'Mozilla/5.0 (X11; Linux i686; rv:121.0) Gecko/20100101 Firefox/121.0',
  'Mozilla/5.0 (X11; Linux x86_64; rv:121.0) Gecko/20100101 Firefox/121.0',
  'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:121.0) Gecko/20100101 Firefox/121.0',
  
  // Safari - macOS
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Safari/605.1.15',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Safari/605.1.15',
  
  // Edge - Windows
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36 Edg/119.0.0.0',
  'Mozilla/5.0 (Windows NT 11.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36 Edg/121.0.0.0',
  
  // Edge - macOS
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0',
  
  // Opera - Windows
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 OPR/106.0.0.0',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36 OPR/105.0.0.0',
  
  // Opera - macOS
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 OPR/106.0.0.0',
  
  // Vivaldi
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Vivaldi/6.5.3206.48',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Vivaldi/6.5.3206.48',
  
  // Brave
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Brave/120.0.0.0',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Brave/120.0.0.0',
  
  // Mobile browsers
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Mobile/15E148 Safari/604.1',
  'Mozilla/5.0 (iPad; CPU OS 17_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Mobile/15E148 Safari/604.1',
  'Mozilla/5.0 (Linux; Android 14; SM-G998B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
  'Mozilla/5.0 (Linux; Android 13; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Mobile Safari/537.36'
];

function getRandomUserAgent(): string {
  return userAgents[Math.floor(Math.random() * userAgents.length)];
}

// Helper function to make HTTP request with retry logic
async function fetchWithRetry(url: string, options: any = {}, maxRetries = 3): Promise<any> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await $fetch(url, {
        ...options,
        headers: {
          'User-Agent': getRandomUserAgent(),
          'Accept': 'application/json, text/plain, */*',
          'Accept-Language': 'en-US,en;q=0.9',
          'Accept-Encoding': 'gzip, deflate, br',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
          'Sec-Fetch-Dest': 'empty',
          'Sec-Fetch-Mode': 'cors',
          'Sec-Fetch-Site': 'cross-site',
          ...options.headers
        },
        timeout: 10000, // 10 second timeout
      });
      
      return response;
    } catch (error: any) {
      console.log(`Attempt ${attempt} failed:`, error.message);
      
      if (attempt === maxRetries) {
        throw error;
      }
      
      // Exponential backoff: wait longer between retries
      const waitTime = Math.min(1000 * Math.pow(2, attempt - 1), 10000);
      console.log(`Waiting ${waitTime}ms before retry...`);
      await delay(waitTime);
    }
  }
}

export default defineEventHandler(async (event) => {
  const kv = event.context.cloudflare.env.footykv;

  if (!kv) {
    throw new Error("KV store 'footykv' is not available.");
  }

  if (!event.context.cloudflare?.env?.DB) {
    throw new Error("Database binding 'DB' is not available.");
  }

  const db = drizzle(event.context.cloudflare.env.DB as any);

  try {
    // Get gameId from query parameters or body
    const query = getQuery(event);
    const body = await readBody(event).catch(() => ({}));
    const gameId = query.gameId || body.gameId;
    const batchMode = query.batch === 'true' || body.batch === true;

    // If no gameId and batch mode, find games currently happening
    if (!gameId && batchMode) {
      const currentUnixTime = Math.floor(Date.now() / 1000);
      // Find games where current time is within [game_start - 1min, game_start + 200min]
      // This means: game_start >= current_time - 200min AND game_start <= current_time + 1min
      const earliestGameStart = currentUnixTime - (200 * 60); // Games that started up to 200 minutes ago
      const latestGameStart = currentUnixTime + 60; // Games starting up to 1 minute from now

      console.log(`Batch mode: Looking for games between ${earliestGameStart} and ${latestGameStart} (current: ${currentUnixTime})`);

      // Find games within the time window
      const activeGames = await db
        .select()
        .from(games)
        .where(and(
          gte(games.unixtime, earliestGameStart),
          lte(games.unixtime, latestGameStart)
        ));

      console.log(`Found ${activeGames.length} games in the active time window`);

      if (activeGames.length === 0) {
        return {
          success: true,
          message: 'No games currently happening',
          gamesProcessed: 0,
          timeWindow: { start: earliestGameStart, end: latestGameStart, current: currentUnixTime }
        };
      }

      const results = [];
      const errors = [];

      // Process each active game
      for (const game of activeGames) {
        try {
          const result = await processGame(game, kv);
          results.push(result);
          
          // Add delay between requests to avoid overwhelming the API
          await delay(2000); // 2 second delay between games
        } catch (error: any) {
          console.error(`Error processing game ${game.id}:`, error.message);
          errors.push({
            gameId: game.id,
            apiID: game.apiID,
            error: error.message
          });
        }
      }

      return {
        success: true,
        message: `Batch update completed. Processed ${results.length} games successfully, ${errors.length} errors.`,
        gamesProcessed: results.length,
        errors: errors,
        results: results,
        timeWindow: { start: earliestGameStart, end: latestGameStart, current: currentUnixTime }
      };
    }

    // Original single game processing
    if (!gameId) {
      throw new Error('gameId parameter is required when not in batch mode');
    }

    const gameIdNum = parseInt(gameId as string);
    if (isNaN(gameIdNum)) {
      throw new Error('Invalid gameId format');
    }

    // Fetch the game from database to get its apiID
    const gameResult = await db
      .select()
      .from(games)
      .where(eq(games.id, gameIdNum))
      .limit(1);

    if (gameResult.length === 0) {
      throw new Error(`Game with ID ${gameId} not found in database`);
    }

    const game = gameResult[0];
    const result = await processGame(game, kv);
    
    return result;
  } catch (error: any) {
    console.error('Error updating cache:', error);
    setResponseStatus(event, 500);
    return { success: false, message: 'Failed to update cache.', error: error.message };
  }
});

// Extract game processing logic into a separate function
async function processGame(game: any, kv: any) {
  const apiID = game.apiID;

  // Check if we've made a request recently for this specific game to avoid overwhelming the API
  const lastRequestKey = `last_api_request:${apiID}`;
  const lastRequest = await kv.get(lastRequestKey);
  
  if (lastRequest) {
    const lastRequestTime = parseInt(lastRequest);
    const timeSinceLastRequest = Date.now() - lastRequestTime;
    const minInterval = 30000; // 30 seconds minimum between requests
    
    if (timeSinceLastRequest < minInterval) {
      const waitTime = minInterval - timeSinceLastRequest;
      throw new Error(`Rate limit: Please wait ${Math.ceil(waitTime / 1000)} seconds before making another request for game ${game.id}`);
    }
  }

  // Update last request time for this specific game
  await kv.put(lastRequestKey, Date.now().toString(), { expirationTtl: 3600 });

  console.log(`Fetching AFL data for game ${game.id} (apiID: ${apiID})...`);
  const data: AFLData = await fetchWithRetry(`https://new.dtlive.com.au/storage/games/${apiID}.json`);

  const { gameDetails, home, away } = data;

  // Save game details with apiID as key
  const gameKey = `game:${apiID}`;
  await kv.put(gameKey, JSON.stringify(gameDetails), { expirationTtl: 3600 * 24 }); // 24 hour expiry

  // Save home players with team info and apiID association
  for (const player of home.players) {
    const playerKey = `player:${apiID}:${player.playerId}`;
    const playerWithTeam = {
      ...player,
      team: 'home',
      teamName: gameDetails.homeTeamName,
      teamShort: gameDetails.homeTeamShort,
      gameApiID: apiID
    };
    await kv.put(playerKey, JSON.stringify(playerWithTeam), { expirationTtl: 3600 * 24 });
  }

  // Save away players with team info and apiID association
  for (const player of away.players) {
    const playerKey = `player:${apiID}:${player.playerId}`;
    const playerWithTeam = {
      ...player,
      team: 'away',
      teamName: gameDetails.awayTeamName,
      teamShort: gameDetails.awayTeamShort,
      gameApiID: apiID
    };
    await kv.put(playerKey, JSON.stringify(playerWithTeam), { expirationTtl: 3600 * 24 });
  }

  // Update the last update timestamp for this specific game
  await kv.put(`last_update_time:${apiID}`, Date.now().toString(), { expirationTtl: 3600 * 24 });
  
  console.log(`Cache updated successfully for game ${game.id} (apiID: ${apiID})`);
  return { 
    success: true, 
    message: `Cache updated successfully for game ${game.id}.`,
    gameId: game.id,
    apiID: apiID,
    homeTeam: gameDetails.homeTeamName,
    awayTeam: gameDetails.awayTeamName
  };
} 