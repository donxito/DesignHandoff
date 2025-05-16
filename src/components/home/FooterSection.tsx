import Link from "next/link";
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

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          <div>
            <div className="flex items-center mb-4">
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
            <Text as="p" className="text-gray-400 mb-4">
              Bridging the gap between design and development with retro style.
            </Text>
            <div className="flex space-x-4">
              {["twitter", "github", "instagram"].map((social) => (
                <a
                  key={social}
                  href="#"
                  className="w-10 h-10 flex items-center justify-center border-2 border-gray-700 hover:border-pink-500 rounded-full transition-colors"
                  aria-label={`${social} link`}
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
                    {social === "twitter" && (
                      <path d="M22 4.01c-1 .49-1.98.689-3 .99-1.121-1.265-2.783-1.335-4.38-.737S11.977 6.323 12 8v1c-3.245.083-6.135-1.395-8-4 0 0-4.182 7.433 4 11-1.872 1.247-3.739 2.088-6 2 3.308 1.803 6.913 2.423 10.034 1.517 3.58-1.04 6.522-3.723 7.651-7.742a13.84 13.84 0 0 0 .497-3.753C20.18 7.773 21.692 5.25 22 4.009z" />
                    )}
                    {social === "github" && (
                      <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
                    )}
                    {social === "instagram" && (
                      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37zM17.5 6.5h.01M7 22h10a5 5 0 0 0 5-5V7a5 5 0 0 0-5-5H7a5 5 0 0 0-5 5v10a5 5 0 0 0 5 5z" />
                    )}
                  </svg>
                </a>
              ))}
            </div>
          </div>

          <div>
            <Text
              as="h4"
              className="text-lg font-bold mb-4 font-pixel text-yellow-400"
            >
              Product
            </Text>
            <ul className="space-y-2">
              <li>
                <Link
                  href="#"
                  className="text-gray-400 hover:text-pink-400 transition-colors"
                >
                  Features
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-gray-400 hover:text-pink-400 transition-colors"
                >
                  Pricing
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-gray-400 hover:text-pink-400 transition-colors"
                >
                  Integrations
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <Text
              as="h4"
              className="text-lg font-bold mb-4 font-pixel text-yellow-400"
            >
              Resources
            </Text>
            <ul className="space-y-2">
              <li>
                <Link
                  href="#"
                  className="text-gray-400 hover:text-pink-400 transition-colors"
                >
                  Documentation
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-gray-400 hover:text-pink-400 transition-colors"
                >
                  Tutorials
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-gray-400 hover:text-pink-400 transition-colors"
                >
                  Blog
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <Text
              as="h4"
              className="text-lg font-bold mb-4 font-pixel text-yellow-400"
            >
              Company
            </Text>
            <ul className="space-y-2">
              <li>
                <Link
                  href="#"
                  className="text-gray-400 hover:text-pink-400 transition-colors"
                >
                  About
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-gray-400 hover:text-pink-400 transition-colors"
                >
                  Contact
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-gray-400 hover:text-pink-400 transition-colors"
                >
                  Privacy
                </Link>
              </li>
            </ul>
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
        <div className="mt-6 text-center font-mono text-xs text-gray-700">
          <p>
            DesignHandoff v1.0 · Memory: 640K (That should be enough for
            anybody)
          </p>
        </div>
      </div>
    </footer>
  );
}
