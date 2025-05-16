import Link from "next/link";
import { Button } from "@/components/retroui/Button";
import { Badge } from "@/components/retroui/Badge";
import { Text } from "@/components/retroui/Text";
import RetroStats from "./ui/RetroStats";

export default function GameCtaSection() {
  return (
    <section className="relative z-10 py-16 md:py-24 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-pink-400/20 to-blue-400/20 dark:from-pink-800/20 dark:to-blue-800/20 transform skew-y-6"></div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto">
          <div className="bg-black border-4 border-yellow-400 p-8 rounded-lg shadow-[12px_12px_0px_0px_rgba(234,179,8,1)] dark:shadow-[12px_12px_0px_0px_rgba(234,179,8,0.7)]">
            <div className="text-center mb-8">
              <Badge variant="warning" className="mb-4 inline-block text-black">
                Game On!
              </Badge>
              <Text
                as="h2"
                className="text-3xl md:text-4xl font-bold mb-4 font-pixel text-yellow-400"
              >
                Ready to Level Up Your Design Workflow?
              </Text>
              <Text as="p" className="text-lg text-white max-w-2xl mx-auto">
                Join the DesignHandoff community and transform your
                design-to-development process. No more pixel-hunting or spec
                confusion!
              </Text>
            </div>

            {/* Mini "Game" */}
            <div className="mb-8 p-4 bg-gray-900 border-2 border-yellow-400 rounded-lg">
              <div className="flex flex-col items-center">
                <div className="bg-gray-800 p-4 w-full max-w-xl border-2 border-gray-700 rounded mb-4 aspect-video relative overflow-hidden">
                  {/* Game viewport with pixel character and obstacles */}
                  <div className="absolute bottom-4 left-1/4 w-8 h-8 bg-yellow-400 rounded-sm flex items-center justify-center">
                    <span className="font-pixel text-black">◆</span>
                  </div>

                  {/* Obstacles */}
                  <div className="absolute bottom-4 right-8 w-8 h-12 bg-pink-500 rounded-sm"></div>
                  <div className="absolute bottom-4 right-24 w-8 h-8 bg-blue-500 rounded-sm"></div>
                  <div className="absolute bottom-4 right-40 w-8 h-16 bg-green-500 rounded-sm"></div>

                  {/* Goal */}
                  <div className="absolute bottom-4 right-4 w-4 h-12 flex flex-col items-center justify-center">
                    <div className="w-4 h-4 bg-white rounded-sm"></div>
                    <div className="h-8 w-1 bg-white"></div>
                  </div>

                  {/* Instructions */}
                  <div className="absolute top-2 left-2 text-white text-xs font-pixel">
                    Press SPACE to jump, → to move forward
                  </div>
                </div>

                <div className="flex space-x-4">
                  <Button
                    variant="outline"
                    className="border-yellow-400 text-yellow-400 font-pixel"
                  >
                    Play Demo
                  </Button>
                  <Link href="/auth/signup" className="no-underline">
                    <Button variant="primary" className="font-pixel">
                      Skip to Sign Up →
                    </Button>
                  </Link>
                </div>
              </div>
            </div>

            {/* Stats in retro game style */}
            <RetroStats />
          </div>
        </div>
      </div>
    </section>
  );
}
