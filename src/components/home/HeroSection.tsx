import Link from "next/link";
import { Button } from "@/components/retroui/Button";
import { Badge } from "@/components/retroui/Badge";
import { Avatar } from "@/components/retroui/Avatar";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
} from "@/components/retroui/Dialog";
import RetroTerminal from "@/components/home/ui/RetroTerminal";
import { PlayCircle, FileImage, Palette, Download } from "lucide-react";

export default function HeroSection() {
  return (
    <section className="relative z-10 py-12 md:py-20 overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
          {/* Text Column (Left) */}
          <div className="w-full md:w-3/5 space-y-6">
            <Badge
              variant="warning"
              className="animate-bounce mb-4 text-black dark:text-black scale-100 hover:scale-105 transition-transform"
            >
              <span className="px-2">New Release v1.0</span>
            </Badge>

            <h1 className="text-5xl md:text-7xl font-bold font-pixel tracking-tight leading-none text-black dark:text-white mb-2">
              <span className="inline-block transform hover:rotate-2 transition-transform duration-300">
                Design
              </span>
              <span className="inline-block text-pink-500 dark:text-pink-400 px-2 transform hover:rotate-2 transition-transform duration-300">
                +
              </span>
              <span className="inline-block text-blue-500 dark:text-blue-400 transform hover:rotate-2 transition-transform duration-300">
                Dev
              </span>
              <br />
              <span className="inline-block transform hover:rotate-2 transition-transform duration-300">
                Reimagined.
              </span>
            </h1>

            <p className="text-xl text-black dark:text-white max-w-lg">
              <span className="font-bold">DesignHandoff</span> bridges the gap
              between design and development with a nostalgic twist — making
              collaboration fun again.
            </p>

            <div className="flex flex-wrap gap-4 pt-4">
              <Link
                href="/auth/signup"
                className="no-underline transform hover:scale-105 transition-transform"
              >
                <Button
                  size="lg"
                  variant="primary"
                  className="font-bold px-8 py-4 text-lg shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:shadow-[6px_6px_0px_0px_rgba(255,255,255,0.5)]"
                >
                  Get Started Now →
                </Button>
              </Link>

              <Dialog>
                <DialogTrigger className="inline-flex items-center justify-center rounded-md ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border-2 border-input bg-background hover:bg-accent hover:text-accent-foreground h-11 px-8 py-4 text-lg font-bold shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:shadow-[6px_6px_0px_0px_rgba(255,255,255,0.5)] hover:scale-105 transition-transform backdrop-blur-lg">
                  <PlayCircle className="w-5 h-5 mr-2" />
                  See How It Works
                </DialogTrigger>
                <DialogContent className="max-w-3xl">
                  <DialogHeader>
                    <DialogTitle>How DesignHandoff Works</DialogTitle>
                  </DialogHeader>

                  {/* Interactive workflow demonstration */}
                  <div className="bg-gray-900 border-4 border-yellow-400 rounded-lg p-6 min-h-[400px]">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full">
                      {/* Step 1: Upload */}
                      <div className="bg-gray-800 border-2 border-pink-500 rounded-lg p-4 text-center">
                        <div className="w-16 h-16 bg-pink-500 rounded-full flex items-center justify-center mx-auto mb-3">
                          <FileImage className="w-8 h-8 text-white" />
                        </div>
                        <h3 className="font-pixel text-pink-400 mb-2">
                          1. Upload
                        </h3>
                        <p className="text-white text-sm">
                          Designer uploads design files to project
                        </p>
                        <div className="mt-3 w-full h-2 bg-gray-700 rounded">
                          <div className="w-full h-2 bg-pink-500 rounded animate-pulse"></div>
                        </div>
                      </div>

                      {/* Step 2: Extract */}
                      <div className="bg-gray-800 border-2 border-yellow-500 rounded-lg p-4 text-center">
                        <div className="w-16 h-16 bg-yellow-500 rounded-full flex items-center justify-center mx-auto mb-3">
                          <Palette className="w-8 h-8 text-black" />
                        </div>
                        <h3 className="font-pixel text-yellow-400 mb-2">
                          2. Extract
                        </h3>
                        <p className="text-white text-sm">
                          Auto-extract colors, fonts, measurements
                        </p>
                        <div className="mt-3 flex gap-1 justify-center">
                          <div className="w-3 h-3 bg-red-500 rounded animate-bounce"></div>
                          <div className="w-3 h-3 bg-blue-500 rounded animate-bounce delay-100"></div>
                          <div className="w-3 h-3 bg-green-500 rounded animate-bounce delay-200"></div>
                        </div>
                      </div>

                      {/* Step 3: Handoff */}
                      <div className="bg-gray-800 border-2 border-blue-500 rounded-lg p-4 text-center">
                        <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-3">
                          <Download className="w-8 h-8 text-white" />
                        </div>
                        <h3 className="font-pixel text-blue-400 mb-2">
                          3. Handoff
                        </h3>
                        <p className="text-white text-sm">
                          Developer gets specs and assets instantly
                        </p>
                        <div className="mt-3 w-full h-2 bg-gray-700 rounded">
                          <div className="w-3/4 h-2 bg-blue-500 rounded animate-pulse"></div>
                        </div>
                      </div>
                    </div>

                    {/* Bottom message */}
                    <div className="text-center mt-6">
                      <p className="font-pixel text-green-400 text-lg">
                        70% Faster Handoff Process!
                      </p>
                    </div>
                  </div>

                  <DialogFooter>
                    <Link href="/auth/signup" className="no-underline">
                      <Button variant="primary">Start Your Project →</Button>
                    </Link>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            {/* Social proof */}
            <div className="pt-6 flex flex-wrap items-center gap-4">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <Avatar key={i} className="w-8 h-8 border-2 border-white">
                    <Avatar.Fallback>
                      {String.fromCharCode(64 + i)}
                    </Avatar.Fallback>
                  </Avatar>
                ))}
              </div>
              <p className="text-sm text-black dark:text-white">
                <span className="font-bold">500+</span> designers & developers
                trust DesignHandoff
              </p>
            </div>
          </div>

          {/* Retro Computer Display (Right) */}
          <div className="w-full md:w-2/5 relative">
            <RetroTerminal />

            {/* Decorative elements */}
            <div className="absolute -top-6 -right-6 w-20 h-20 bg-pink-400 border-4 border-black rounded-lg transform rotate-12 z-[-1]"></div>
            <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-blue-400 border-4 border-black rounded-full transform -rotate-12 z-[-1]"></div>
          </div>
        </div>
      </div>
    </section>
  );
}
