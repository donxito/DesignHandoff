import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="w-full py-6 px-4 sm:px-6 lg:px-8 border-b">
        <div className="flex justify-between items-center max-w-7xl mx-auto">
          <div className="flex items-center">
            <span className="text-2xl font-bold">DesignHandoff</span>
          </div>
          <div className="flex items-center space-x-4">
            <Link
              href="/login"
              className="py-2 px-4 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100"
            >
              Login
            </Link>
            <Link
              href="/register"
              className="py-2 px-4 rounded-md text-sm font-medium bg-blue-600 text-white hover:bg-blue-700"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-grow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-gray-900">
              <span className="block">Bridge the gap between</span>
              <span className="block text-blue-600">
                Design and Development
              </span>
            </h1>
            <p className="mt-6 max-w-2xl mx-auto text-xl text-gray-500">
              DesignHandoff helps teams collaborate seamlessly by providing
              developers with accurate specifications, assets, and code snippets
              directly from design files.
            </p>
            <div className="mt-10">
              <Link
                href="/register"
                className="py-3 px-6 rounded-md text-lg font-medium bg-blue-600 text-white hover:bg-blue-700"
              >
                Start Your Free Trial
              </Link>
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-gray-50 border-t">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <p className="text-center text-gray-500 text-sm">
            &copy; 2025 DesignHandoff. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
