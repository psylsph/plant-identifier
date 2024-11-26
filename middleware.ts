import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
 
export function middleware(request: NextRequest) {
  // Clone the request headers
  const requestHeaders = new Headers(request.headers)
 
  // Add API key header if it's an API route
  if (request.nextUrl.pathname.startsWith('/api/')) {
    requestHeaders.set('x-api-key', process.env.PLANT_ID_API_KEY || '')
  }
 
  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  })
}
 
export const config = {
  matcher: '/api/:path*',
}
