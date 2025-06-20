import { drizzle } from 'drizzle-orm/d1';
import { sql } from 'drizzle-orm';
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
    // Get distinct rounds with their names and years, ordered by year and round
    const rounds = await db
      .select({
        round: games.round,
        roundname: games.roundname,
        year: games.year,
      })
      .from(games)
      .groupBy(games.year, games.round, games.roundname)
      .orderBy(games.year, games.round);

    return {
      success: true,
      rounds: rounds.map(r => ({
        value: `${r.year}-${r.round}`,
        label: `${r.year} - ${r.roundname}`,
        round: r.round,
        roundname: r.roundname,
        year: r.year,
      }))
    };

  } catch (error: any) {
    console.error('Error fetching rounds:', error);
    
    return {
      success: false,
      error: error.message || 'Unknown error occurred',
      rounds: []
    };
  }
}); 