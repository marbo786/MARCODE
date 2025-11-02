/**
 * Navigation Bar Component
 * Simple top navbar with navigation links.
 */

import Link from 'next/link';
import { useRouter } from 'next/router';

const Navbar = () => {
  const router = useRouter();

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="text-2xl font-bold text-teal-600 hover:text-teal-700">
            Marcode
          </Link>
          
          <div className="flex space-x-6">
            <Link
              href="/"
              className={`text-sm font-medium transition-colors ${
                router.pathname === '/'
                  ? 'text-teal-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Home
            </Link>
            <Link
              href="/compare"
              className={`text-sm font-medium transition-colors ${
                router.pathname === '/compare'
                  ? 'text-teal-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Compare
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

