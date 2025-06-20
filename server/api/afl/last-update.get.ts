export default defineEventHandler(async (event) => {
  const kv = event.context.cloudflare.env.footykv

  if (!kv) {
    throw createError({
      statusCode: 500,
      statusMessage: "KV store 'footykv' is not available."
    })
  }

  try {
    const lastUpdateTime = await kv.get('last_update_time') || '0'
    
    return {
      lastUpdateTime,
      timestamp: Date.now()
    }
  } catch (error: any) {
    console.error('Error retrieving last update time:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to retrieve last update time'
    })
  }
}) 