export default defineEventHandler(async (event) => {
  // Set headers for Server-Sent Events
  setHeader(event, 'Content-Type', 'text/event-stream')
  setHeader(event, 'Cache-Control', 'no-cache')
  setHeader(event, 'Connection', 'keep-alive')
  setHeader(event, 'Access-Control-Allow-Origin', '*')
  setHeader(event, 'Access-Control-Allow-Headers', 'Cache-Control')

  const kv = event.context.cloudflare.env.footykv

  if (!kv) {
    throw createError({
      statusCode: 500,
      statusMessage: "KV store 'footykv' is not available."
    })
  }

  // Function to send data to client
  const sendEvent = (data: any) => {
    return `data: ${JSON.stringify(data)}\n\n`
  }

  // Send initial connection confirmation
  const initialMessage = sendEvent({
    type: 'connected',
    timestamp: Date.now()
  })

  // Get current data version/timestamp
  let lastUpdateTime = await kv.get('last_update_time') || '0'

  // Send initial data
  try {
    const gameKey = 'game:2021:14:StK:WB'
    const gameDetailsStr = await kv.get(gameKey)
    
    if (gameDetailsStr) {
      const gameDetails = JSON.parse(gameDetailsStr)
      const updateMessage = sendEvent({
        type: 'data_update',
        gameDetails,
        timestamp: Date.now()
      })
      
      return new Response(initialMessage + updateMessage, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
          'Access-Control-Allow-Origin': '*'
        }
      })
    }
  } catch (error) {
    console.error('Error in SSE endpoint:', error)
  }

  return new Response(initialMessage, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*'
    }
  })
}) 