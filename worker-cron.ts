export default {
  async scheduled(controller: ScheduledController, env: any, ctx: ExecutionContext) {
    console.log('Cron job triggered at:', new Date().toISOString());
    
    try {
      // Get the domain from environment or use a default
      const domain = env.DOMAIN || 'footy-wtf-footy.pages.dev';
      const url = `https://${domain}/api/afl/update-cache`;
      
      console.log('Calling update-cache endpoint:', url);
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Cloudflare-Cron-Worker/1.0',
        },
      });
      
      const responseText = await response.text();
      
      if (!response.ok) {
        console.error(`Cache update failed: ${response.status} ${response.statusText}`);
        console.error('Response body:', responseText);
        return;
      }
      
      const result = JSON.parse(responseText);
      console.log('Cache update completed successfully:', result);
      
    } catch (error: any) {
      console.error('Error during scheduled cache update:', error.message);
    }
  },
}; 