import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  // En production avec Authelia, rediriger vers l'URL de déconnexion d'Authelia
  // Authelia gère la déconnexion et redirige vers la page de connexion
  
  const authLogoutUrl = process.env.AUTHELIA_LOGOUT_URL || 'https://auth.example.com/logout';
  
  // Rediriger vers Authelia logout qui redirigera ensuite vers la page d'accueil
  return NextResponse.redirect(`${authLogoutUrl}?rd=${encodeURIComponent(request.nextUrl.origin)}`);
}


