export default {
  async scheduled(controller: ScheduledController, env: any, ctx: ExecutionContext) {
    console.log('Cron job triggered at:', new Date().toISOString());
    
    try {
      // Get the domain from environment or use a default
      const domain = env.DOMAIN || 'footy-wtf-footy.pages.dev';
      const url = `https://${domain}/api/afl/update-cache?batch=true`;
      
      console.log('Calling update-cache endpoint in batch mode:', url);
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Cloudflare-Cron-Worker/1.0',
        },
        body: JSON.stringify({ batch: true })
      });
      
      const responseText = await response.text();
      
      if (!response.ok) {
        console.error(`Cache update failed: ${response.status} ${response.statusText}`);
        console.error('Response body:', responseText);
        return;
      }
      
      const result = JSON.parse(responseText);
      console.log('Batch cache update completed:', result);
      
      // Log summary
      if (result.gamesProcessed > 0) {
        console.log(`Successfully processed ${result.gamesProcessed} active games`);
        if (result.errors && result.errors.length > 0) {
          console.log(`Errors encountered for ${result.errors.length} games:`, result.errors);
        }
      } else {
        console.log('No games currently happening within the time window');
      }
      
    } catch (error: any) {
      console.error('Error during scheduled cache update:', error.message);
    }
  },
}; 