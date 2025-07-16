import { Text } from "@/components/retroui/Text";

export default function FooterSection() {
  return (
    <footer className="bg-black text-white border-t-4 border-pink-500 relative z-10">
      <div className="container mx-auto px-4 py-12">
        {/* Top Wave Pattern */}
        <div className="h-8 mb-8 overflow-hidden">
          <div className="flex">
            {Array.from({ length: 30 }).map((_, i) => (
              <div
                key={i}
                className={`w-8 h-8 rounded-full ${i % 3 === 0 ? "bg-pink-500" : i % 3 === 1 ? "bg-blue-500" : "bg-yellow-400"} -ml-4`}
              ></div>
            ))}
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between mb-12 gap-8">
          {/* Brand/Logo */}
          <div className="flex items-center mb-4 md:mb-0">
            <div className="w-10 h-10 bg-pink-500 border-3 border-white rounded-full flex items-center justify-center mr-3">
              <span className="text-white font-bold text-lg">D</span>
            </div>
            <Text
              as="h3"
              className="text-xl font-bold font-pixel text-yellow-400"
            >
              DesignHandoff
            </Text>
          </div>

          {/* Social Icons */}
          <div className="flex space-x-4">
            {/* LinkedIn */}
            <a
              href="https://www.linkedin.com/in/miguelchito-reactdeveloper/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn"
              className="w-10 h-10 flex items-center justify-center border-2 border-gray-700 hover:border-pink-500 rounded-full transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-gray-400 hover:text-pink-400 transition-colors"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.761 0 5-2.239 5-5v-14c0-2.761-2.239-5-5-5zm-11 19h-3v-10h3v10zm-1.5-11.268c-.966 0-1.75-.784-1.75-1.75s.784-1.75 1.75-1.75 1.75.784 1.75 1.75-.784 1.75-1.75 1.75zm15.5 11.268h-3v-5.604c0-1.337-.025-3.063-1.868-3.063-1.868 0-2.154 1.459-2.154 2.967v5.7h-3v-10h2.881v1.367h.041c.401-.761 1.379-1.563 2.841-1.563 3.039 0 3.6 2.001 3.6 4.601v5.595z" />
              </svg>
            </a>
            {/* GitHub */}
            <a
              href="https://github.com/donxito"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub"
              className="w-10 h-10 flex items-center justify-center border-2 border-gray-700 hover:border-pink-500 rounded-full transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-gray-400 hover:text-pink-400 transition-colors"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
              </svg>
            </a>
            {/* Website */}
            <a
              href="https://mchito.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Personal Website"
              className="w-10 h-10 flex items-center justify-center border-2 border-gray-700 hover:border-pink-500 rounded-full transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-gray-400 hover:text-pink-400 transition-colors"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="2" y1="12" x2="22" y2="12" />
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
              </svg>
            </a>
          </div>
        </div>

        {/* Retro horizontal divider */}
        <div className="flex items-center justify-center mb-8">
          <div className="w-1/3 h-1 bg-gradient-to-r from-transparent via-pink-500 to-transparent"></div>
          <div className="w-8 h-8 bg-yellow-400 border-2 border-white rounded-full mx-2 transform rotate-45"></div>
          <div className="w-1/3 h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent"></div>
        </div>

        <div className="text-center">
          <Text as="p" className="text-gray-500 mb-2 font-pixel">
            &copy; {new Date().getFullYear()} DesignHandoff. All rights
            reserved.
          </Text>
          <Text as="p" className="text-xs text-gray-600">
            Made with 💖 and nostalgia for the good old days
          </Text>
        </div>

        {/* Retro console info */}
        <div className="mt-6 text-center font-mono text-xs text-gray-400">
          <p>
            DesignHandoff v1.0 · Memory: 640K (That should be enough for
            anybody)
          </p>
        </div>
      </div>
    </footer>
  );
}
