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

export default {
  async scheduled(event: ScheduledEvent, env: any, ctx: ExecutionContext) {
    console.log('Cron job triggered - updating AFL cache...');
    
    const kv = env.footykv;
    
    if (!kv) {
      console.error("KV store 'footykv' is not available in cron job");
      return;
    }

    try {
      // Check rate limiting
      const lastRequestKey = 'last_api_request';
      const lastRequest = await kv.get(lastRequestKey);
      
      if (lastRequest) {
        const lastRequestTime = parseInt(lastRequest);
        const timeSinceLastRequest = Date.now() - lastRequestTime;
        const minInterval = 30000; // 30 seconds minimum between requests
        
        if (timeSinceLastRequest < minInterval) {
          console.log(`Rate limited: ${Math.ceil((minInterval - timeSinceLastRequest) / 1000)}s remaining`);
          return;
        }
      }

      console.log('Fetching AFL data from API...');
      
      // Fetch the AFL data
      const response = await fetch('https://new.dtlive.com.au/storage/games/3222.json', {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'application/json, text/plain, */*',
          'Accept-Language': 'en-US,en;q=0.9',
          'Cache-Control': 'no-cache',
        },
      });

      if (!response.ok) {
        throw new Error(`AFL API responded with ${response.status}: ${response.statusText}`);
      }

      const data: AFLData = await response.json();
      
      // Update last request time
      await kv.put(lastRequestKey, Date.now().toString(), { expirationTtl: 3600 });

      const { gameDetails, home, away } = data;

      // Save game details
      const gameKey = `game:${gameDetails.year}:${gameDetails.round}:${gameDetails.homeTeamShort}:${gameDetails.awayTeamShort}`;
      await kv.put(gameKey, JSON.stringify(gameDetails));

      // Save home players
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

      // Save away players
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

      // Update the last update timestamp
      await kv.put('last_update_time', Date.now().toString());
      
      console.log(`Cache updated successfully - Game: ${gameDetails.homeTeamShort} vs ${gameDetails.awayTeamShort}`);
      
    } catch (error) {
      console.error('Error during scheduled cache update:', error);
    }
  },
}; 