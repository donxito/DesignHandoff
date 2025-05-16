import Link from "next/link";
import { Button } from "@/components/retroui/Button";
import { Badge } from "@/components/retroui/Badge";
import { Avatar } from "@/components/retroui/Avatar";
import { Text } from "@/components/retroui/Text";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
} from "@/components/retroui/Dialog";
import RetroTerminal from "@/components/home/ui/RetroTerminal";

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

            <h1 className="text-5xl md:text-7xl font-bold font-pixel tracking-tight leading-none text-black dark:text-white text-adaptive mb-2">
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

            <p className="text-xl text-black dark:text-white text-adaptive max-w-lg">
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
                <DialogTrigger className="inline-flex items-center justify-center rounded-md ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border-2 border-input bg-background hover:bg-accent hover:text-accent-foreground h-11 px-8 py-4 text-lg font-bold shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:shadow-[6px_6px_0px_0px_rgba(255,255,255,0.5)] hover:scale-105 transition-transform">
                  Watch Demo
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>Watch the Demo</DialogHeader>
                  <div className="aspect-video bg-black relative overflow-hidden border-4 border-yellow-400">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Text className="text-white text-lg">
                        Demo video placeholder
                      </Text>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline">Close</Button>
                    <Button variant="primary">Sign Up Now</Button>
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
