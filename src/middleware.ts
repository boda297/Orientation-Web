import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const token = request.cookies.get('accessToken')?.value;

    const pathname = request.nextUrl.pathname;

    const isAuthRoute = pathname.startsWith('/login') ||
        pathname.startsWith('/register') ||
        pathname.startsWith('/forgot-password') ||
        pathname.startsWith('/verify') ||
        pathname.startsWith('/reset-password');

    const isPublicRoute = pathname === '/' || pathname === '/about' || pathname.startsWith('/project') || pathname.startsWith('/areas') || pathname.startsWith('/news') || pathname.startsWith('/courses') || pathname.startsWith('/tv') || pathname.startsWith('/saved') || pathname.startsWith('/search');

    if (!token && !isAuthRoute && !isPublicRoute) {
        // Redirect to login if trying to access a protected route without token
        return NextResponse.redirect(new URL('/login', request.url));
    }

    if (token && isAuthRoute) {
        // Redirect to home if trying to access auth route with token
        return NextResponse.redirect(new URL('/', request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
