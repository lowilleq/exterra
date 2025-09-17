import createIntlMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';
import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

const intlMiddleware = createIntlMiddleware(routing);

export async function middleware(request: NextRequest) {
    // First handle internationalization
    const response = intlMiddleware(request);

    // Check if this is an admin route
    const pathname = request.nextUrl.pathname;
    const isAdminRoute = pathname.includes('/admin') && !pathname.includes('/admin/login');

    if (isAdminRoute) {
        // Create a Supabase client configured for middleware
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    getAll() {
                        return request.cookies.getAll()
                    },
                    setAll(cookiesToSet) {
                        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
                        cookiesToSet.forEach(({ name, value, options }) =>
                            response.cookies.set(name, value, options)
                        )
                    },
                },
            }
        );

        // Check if user is authenticated
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            // Get the locale from the URL
            const locale = pathname.split('/')[1];
            return NextResponse.redirect(new URL(`/${locale}/admin/login`, request.url));
        }
    }

    return response;
}

export const config = {
    // Match all pathnames except for
    // - … if they start with `/api`, `/trpc`, `/_next` or `/_vercel`
    // - … the ones containing a dot (e.g. `favicon.ico`)
    matcher: '/((?!api|trpc|_next|_vercel|.*\\..*).*)'
};