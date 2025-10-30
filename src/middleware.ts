import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Routes qui ne nécessitent pas d'authentification
const publicRoutes = ['/login']

// Routes protégées (toutes les autres)
const protectedRoutes = [
  '/',
  '/drivers',
  '/partners',
  '/evaluations',
  '/agents',
  '/admin',
  '/settings',
  '/reporting',
  '/notifications',
  '/import-export',
  '/audit'
]

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Vérifier si c'est une route publique
  if (publicRoutes.includes(pathname)) {
    return NextResponse.next()
  }

  // Vérifier si c'est une route protégée ou une sous-route protégée
  const isProtectedRoute = protectedRoutes.some(route =>
    pathname === route || pathname.startsWith(`${route}/`)
  )

  if (isProtectedRoute) {
    // Récupérer le token depuis les cookies ou headers
    const token = request.cookies.get('auth_token')?.value ||
                  request.headers.get('authorization')?.replace('Bearer ', '')

    // Si pas de token, rediriger vers login
    if (!token) {
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(loginUrl)
    }

    // Vérifier la validité du token (basique)
    try {
      // Si le token est un JWT, vérifier sa structure
      if (token.includes('.')) {
        const parts = token.split('.')
        if (parts.length !== 3) {
          const loginUrl = new URL('/login', request.url)
          loginUrl.searchParams.set('redirect', pathname)
          return NextResponse.redirect(loginUrl)
        }

        // Décoder et vérifier l'expiration
        const payload = JSON.parse(atob(parts[1]))
        if (payload.exp && payload.exp * 1000 < Date.now()) {
          const loginUrl = new URL('/login', request.url)
          loginUrl.searchParams.set('redirect', pathname)
          return NextResponse.redirect(loginUrl)
        }
      }
    } catch (error) {
      // Token invalide, rediriger vers login
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}