export default function Footer() {
  return (
    <footer className="border-t bg-white">
      <div className="mx-auto max-w-7xl px-4 py-8 text-sm text-gray-500 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <p>© {new Date().getFullYear()} EduTrack AI. Tous droits réservés.</p>
          <div className="flex items-center gap-4">
            <a href="#features" className="hover:text-gray-700">Fonctionnalités</a>
            <a href="/pricing" className="hover:text-gray-700">Tarifs</a>
            <a href="/auth/register" className="hover:text-gray-700">Commencer</a>
          </div>
        </div>
      </div>
    </footer>
  );
}