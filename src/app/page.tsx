import Link from "next/link";
import Header from "@/components/layout/header";
import { Button } from "@/components/retroui/Button";
import { Text } from "@/components/retroui/Text";
import { Card } from "@/components/retroui/Card";
import { Badge } from "@/components/retroui/Badge";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white dark:bg-[#121212] bg-[url('/grid-pattern.svg')] dark:bg-[url('/grid-pattern-dark.svg')]">
      <Header />
      <main>
        <section className="py-20 border-b-3 border-black dark:border-white relative overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute top-10 left-10 w-20 h-20 bg-yellow-400 border-3 border-black rounded-full opacity-50 animate-pulse"></div>
          <div className="absolute bottom-10 right-10 w-16 h-16 bg-pink-400 border-3 border-black rounded-full opacity-50 animate-pulse"></div>
          <div className="absolute top-40 right-20 w-12 h-12 bg-blue-400 border-3 border-black rounded-full opacity-50 animate-pulse"></div>

          <div className="container mx-auto px-4 text-center relative z-10">
            <Badge variant="warning" className="mb-6 inline-block text-black dark:text-white">
              New Release v1.0
            </Badge>
            <Text
              as="h1"
              className="text-5xl md:text-6xl font-bold mb-6 font-pixel tracking-tight leading-tight text-black dark:text-white text-adaptive"
            >
              Bridge the gap between{" "}
              <span className="text-pink-500 dark:text-pink-400">design</span>{" "}
              and{" "}
              <span className="text-blue-500 dark:text-blue-400">
                development
              </span>
            </Text>
            <Text
              as="p"
              className="text-xl mb-10 max-w-3xl mx-auto font-medium text-black dark:text-white text-adaptive"
            >
              DesignHandoff streamlines the handoff process, helping designers
              and developers collaborate seamlessly with a retro-inspired
              interface.
            </Text>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Link href="/auth/signup" className="no-underline">
                <Button
                  size="lg"
                  variant="primary"
                  className="font-bold px-8 py-4 text-lg"
                >
                  Get Started Now →
                </Button>
              </Link>
              <Link href="/auth/login" className="no-underline">
                <Button
                  variant="outline"
                  size="lg"
                  className="font-bold px-8 py-4 text-lg"
                >
                  Login to Account
                </Button>
              </Link>
            </div>
          </div>
        </section>

        <section className="py-24 border-b-3 border-black dark:border-white relative">
          <div className="absolute left-0 right-0 h-20 bg-gradient-to-r from-yellow-400 via-pink-400 to-blue-400 top-0 opacity-20"></div>
          <div className="container mx-auto px-4 pt-10">
            <div className="flex flex-col items-center mb-16">
              <Badge variant="solid" className="mb-4 text-black dark:text-white">
                POWERFUL FEATURES
              </Badge>
              <Text
                as="h2"
                className="text-4xl font-bold text-center mb-4 tracking-tight text-black dark:text-white text-adaptive"
              >
                Everything you need for seamless design handoff
              </Text>
              <div className="w-24 h-2 bg-pink-500 rounded-full"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card
                variant="primary"
                className="overflow-hidden group transition-all duration-300 hover:-translate-y-2 bg-white dark:bg-[#1e1e1e]"
              >
                <Card.Header>
                  <div className="w-16 h-16 border-3 border-black dark:border-white flex items-center justify-center mx-auto mb-2 bg-pink-400 rounded-full shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] dark:shadow-[3px_3px_0px_0px_rgba(255,255,255,0.7)]">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                      stroke="currentColor"
                      className="w-8 h-8 text-black dark:text-white"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
                      />
                    </svg>
                  </div>
                  <Card.Title className="text-2xl font-bold mb-0 text-black dark:text-white text-adaptive">
                    Design File Management
                  </Card.Title>
                </Card.Header>
                <Card.Content>
                  <Text className="font-medium text-black dark:text-white text-adaptive">
                    Upload, organize, and share design files with your
                    development team in one central location. Supports multiple
                    file formats.
                  </Text>
                </Card.Content>
                <Card.Footer>
                  <Button variant="outline" size="sm" className="w-full">
                    Learn More
                  </Button>
                </Card.Footer>
              </Card>

              <Card
                variant="secondary"
                className="overflow-hidden group transition-all duration-300 hover:-translate-y-2"
              >
                <Card.Header>
                  <div className="w-16 h-16 border-3 border-black flex items-center justify-center mx-auto mb-2 bg-blue-400 rounded-full shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                      stroke="currentColor"
                      className="w-8 h-8 text-black"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z"
                      />
                    </svg>
                  </div>
                  <Card.Title className="text-2xl font-bold mb-0">
                    Design Specifications
                  </Card.Title>
                </Card.Header>
                <Card.Content>
                  <Text className="font-medium">
                    Extract and view detailed design specs, measurements, and
                    styles to ensure pixel-perfect implementation every time.
                  </Text>
                </Card.Content>
                <Card.Footer>
                  <Button variant="outline" size="sm" className="w-full">
                    Learn More
                  </Button>
                </Card.Footer>
              </Card>

              <Card
                variant="default"
                className="overflow-hidden group transition-all duration-300 hover:-translate-y-2"
              >
                <Card.Header>
                  <div className="w-16 h-16 border-3 border-black flex items-center justify-center mx-auto mb-2 bg-yellow-400 rounded-full shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                      stroke="currentColor"
                      className="w-8 h-8 text-black"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125"
                      />
                    </svg>
                  </div>
                  <Card.Title className="text-2xl font-bold mb-0">
                    Asset Management
                  </Card.Title>
                </Card.Header>
                <Card.Content>
                  <Text className="font-medium">
                    Automatically extract and organize design assets for easy
                    access by developers. Includes versioning and history.
                  </Text>
                </Card.Content>
                <Card.Footer>
                  <Button variant="outline" size="sm" className="w-full">
                    Learn More
                  </Button>
                </Card.Footer>
              </Card>
            </div>
          </div>
        </section>
      </main>

      <section className="py-20 bg-gradient-to-r from-pink-100 to-blue-100 dark:from-pink-900 dark:to-blue-900 border-t-3 border-black dark:border-white relative overflow-hidden">
        <div className="absolute -top-5 left-10 w-20 h-20 bg-yellow-400 border-3 border-black rounded-full opacity-20"></div>
        <div className="absolute -bottom-10 right-20 w-32 h-32 bg-pink-400 border-3 border-black rounded-full opacity-20"></div>

        <div className="container mx-auto px-4 text-center">
          <Badge variant="primary" className="mb-6 inline-block">
            Ready to Get Started?
          </Badge>
          <Text as="h2" className="text-4xl font-bold mb-6">
            Join DesignHandoff Today
          </Text>
          <Text as="p" className="text-xl mb-10 max-w-2xl mx-auto">
            Start streamlining your design-to-development workflow with our
            powerful platform.
          </Text>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/signup" className="no-underline">
              <Button size="lg" variant="primary" className="font-bold px-8">
                Sign Up Free →
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <footer className="py-12 bg-black text-white border-t-3 border-black">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <Text as="h3" className="text-xl font-bold mb-4 text-yellow-400">
                DesignHandoff
              </Text>
              <Text as="p" className="text-gray-400">
                Bridging the gap between design and development with retro
                style.
              </Text>
            </div>

            <div>
              <Text as="h4" className="text-lg font-bold mb-4 text-yellow-400">
                Product
              </Text>
              <ul className="space-y-2">
                <li>
                  <Link href="#" className="text-gray-400 hover:text-white">
                    Features
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-400 hover:text-white">
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-400 hover:text-white">
                    Integrations
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <Text as="h4" className="text-lg font-bold mb-4 text-yellow-400">
                Resources
              </Text>
              <ul className="space-y-2">
                <li>
                  <Link href="#" className="text-gray-400 hover:text-white">
                    Documentation
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-400 hover:text-white">
                    Tutorials
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-400 hover:text-white">
                    Blog
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <Text as="h4" className="text-lg font-bold mb-4 text-yellow-400">
                Company
              </Text>
              <ul className="space-y-2">
                <li>
                  <Link href="#" className="text-gray-400 hover:text-white">
                    About
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-400 hover:text-white">
                    Contact
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-400 hover:text-white">
                    Privacy
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 text-center">
            <Text as="p" className="text-gray-500">
              &copy; {new Date().getFullYear()} DesignHandoff. All rights
              reserved.
            </Text>
          </div>
        </div>
      </footer>
    </div>
  );
}
