// app/layout.tsx
import './globals.css';
import Link from 'next/link';
import Image from 'next/image';
import { AuthProvider } from '@/components/AuthProvider';

export const metadata = {
  title: 'EduTrack AI',
  description: 'Suivi scolaire intelligent pour les parents',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className="scroll-smooth">
      <body className="min-h-screen bg-gray-50 text-gray-900">
        <AuthProvider>
          <header className="bg-white">
            <nav className="mx-auto flex max-w-6xl items-center justify-between p-4">
              {/* Logo + nom de marque (lien vers la home) */}
              <Link href="/" className="image-logo flex items-center gap-2">
                <Image
                  src="/logo.png"
                  alt="EduTrack AI"
                  width={150}
                  height={50}
                  priority
                />
              </Link>

              {/* Liens de navigation */}
              <div className="flex items-center gap-4 text-sm">
                {/* Liens internes: utiliser Link */}
                <Link href="/pricing" className="hover:underline">
                  Tarifs
                </Link>
                <Link href="/auth/login" className="hover:underline">
                  Connexion
                </Link>
                <Link
                  href="/auth/register"
                  className="rounded bg-black px-3 py-1.5 text-white hover:bg-gray-800"
                >
                  Essayer
                </Link>
              </div>
            </nav>
          </header>

          <main className="mx-auto max-w-6xl p-4">{children}</main>
        </AuthProvider>
      </body>
    </html>
  );
}