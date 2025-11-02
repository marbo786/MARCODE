/**
 * Home Page
 * Minimal hero layout with "Start Comparison" button.
 */

import type { NextPage } from 'next';
import { useRouter } from 'next/router';
import Navbar from '../components/Navbar';

const Home: NextPage = () => {
  const router = useRouter();

  const handleStartComparison = () => {
    router.push('/compare');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto text-center">
          {/* Hero Section */}
          <div className="mb-12">
            <h1 className="text-5xl font-bold text-gray-900 mb-4">
              Marcode
            </h1>
            <p className="text-xl text-gray-600 mb-2">
              Hybrid Code Plagiarism Detector
            </p>
            <p className="text-gray-500">
              Compare Python and C++ code files using advanced similarity algorithms
            </p>
          </div>

          {/* CTA Button */}
          <button
            onClick={handleStartComparison}
            className="bg-teal-600 hover:bg-teal-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg"
          >
            Start Comparison
          </button>

          {/* Features */}
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-2">Multiple Algorithms</h3>
              <p className="text-gray-600 text-sm">
                Uses Levenshtein, LCS, fingerprinting, and structural analysis
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-2">Fast & Accurate</h3>
              <p className="text-gray-600 text-sm">
                WebAssembly-powered engine for browser-based comparisons
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-2">Python & C++</h3>
              <p className="text-gray-600 text-sm">
                Supports both Python and C++ code file comparison
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Home;

