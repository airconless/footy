export default {
  async scheduled(event: ScheduledEvent, env: any, ctx: ExecutionContext) {
    // Call our cache update endpoint
    try {
      const response = await fetch(`https://footy.${env.DOMAIN || 'your-domain.com'}/api/afl/update-cache`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        console.error(`Cache update failed: ${response.status} ${response.statusText}`);
        return;
      }
      
      const result = await response.json();
      console.log('Cache update completed:', result);
      
    } catch (error) {
      console.error('Error during scheduled cache update:', error);
    }
  },
}; 