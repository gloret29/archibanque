import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
    const remoteUser = request.headers.get('remote-user');

    // If we are in production and these headers are missing, we might want to redirect or error
    // But for now, let's just log and continue
    if (process.env.NODE_ENV === 'production' && !remoteUser) {
        // In a real scenario, Authelia should have caught this. 
        // If not, it means the request bypassed the proxy.
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ],
};
