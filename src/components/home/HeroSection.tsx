import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/retroui/Button";
import { Badge } from "@/components/retroui/Badge";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
} from "@/components/retroui/Dialog";
import RetroTerminal from "@/components/home/ui/RetroTerminal";
import { PlayCircle, Palette, Zap, Users } from "lucide-react";

export default function HeroSection() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  const handleViewDemo = () => {
    router.push("/demo");
  };

  const handleGetStarted = () => {
    if (isAuthenticated) {
      router.push("/dashboard");
    } else {
      router.push("/auth/signup");
    }
  };

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

            <p className="text-xl text-black dark:text-white max-w-lg leading-relaxed">
              <span className="font-bold">DesignHandoff</span> is a modern
              collaboration platform that automates design specification
              extraction and enables real-time team workflow.
            </p>

            {/* Technical Achievement Highlights */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 py-4">
              <div className="flex items-center gap-2 bg-blue-50 dark:bg-blue-900/30 p-2 rounded-lg">
                <Zap className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <span className="text-sm font-pixel text-blue-800 dark:text-blue-200">
                  Real-time Sync
                </span>
              </div>
              <div className="flex items-center gap-2 bg-green-50 dark:bg-green-900/30 p-2 rounded-lg">
                <Palette className="h-4 w-4 text-green-600 dark:text-green-400" />
                <span className="text-sm font-pixel text-green-800 dark:text-green-200">
                  Auto Specs
                </span>
              </div>
              <div className="flex items-center gap-2 bg-purple-50 dark:bg-purple-900/30 p-2 rounded-lg">
                <Users className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                <span className="text-sm font-pixel text-purple-800 dark:text-purple-200">
                  Team Collab
                </span>
              </div>
            </div>

            {/* Call to Action */}
            <div className="flex flex-wrap gap-4 pt-4">
              <Button
                onClick={handleViewDemo}
                variant="primary"
                size="lg"
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.2)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
              >
                View Live Demo →
              </Button>

              {/* Interactive Demo Dialog */}
              <Dialog>
                <DialogTrigger className="font-head transition-all outline-none cursor-pointer flex items-center justify-center gap-2 text-sm font-bold border-2 border-black dark:border-white text-black dark:text-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black px-6 py-4 rounded-[6px] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.2)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-[2px_2px_0px_0px_rgba(255,255,255,0.4)]">
                  <PlayCircle className="h-5 w-5" />
                  Quick Preview
                </DialogTrigger>
                <DialogContent className="max-w-4xl bg-white dark:bg-[#1e1e1e] border-3 border-black dark:border-white">
                  <DialogHeader>
                    <DialogTitle className="font-pixel text-black dark:text-white text-2xl">
                      DesignHandoff - Quick Preview
                    </DialogTitle>
                  </DialogHeader>

                  <div className="space-y-6">
                    {/* Feature showcase */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <h3 className="font-pixel text-lg font-bold text-black dark:text-white">
                          🎯 What You&apos;ll See
                        </h3>
                        <ul className="space-y-2 text-sm font-pixel text-gray-700 dark:text-gray-300">
                          <li>• Upload design files (Figma, Sketch, XD)</li>
                          <li>
                            • Extract colors, fonts & measurements automatically
                          </li>
                          <li>• Leave comments and feedback in real-time</li>
                          <li>
                            • Export assets and specifications for development
                          </li>
                          <li>
                            • Collaborate with your design team seamlessly
                          </li>
                        </ul>
                      </div>

                      <div className="space-y-4">
                        <h3 className="font-pixel text-lg font-bold text-black dark:text-white">
                          🚀 Key Benefits
                        </h3>
                        <ul className="space-y-2 text-sm font-pixel text-gray-700 dark:text-gray-300">
                          <li>• No more manual spec creation</li>
                          <li>• Faster design-to-development handoff</li>
                          <li>• Centralized feedback and approvals</li>
                          <li>• Automatic asset optimization</li>
                          <li>• Keep everyone in sync with live updates</li>
                        </ul>
                      </div>
                    </div>

                    {/* Demo flow */}
                    <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                      <h4 className="font-pixel font-bold mb-3 text-black dark:text-white">
                        🎬 Interactive Demo (3 minutes)
                      </h4>
                      <div className="flex flex-wrap gap-2 text-xs">
                        {[
                          "Create Project",
                          "Upload Design",
                          "Extract Specs",
                          "Add Comments",
                          "Export Assets",
                        ].map((step, index) => (
                          <Badge
                            key={index}
                            variant="secondary"
                            className="font-pixel"
                          >
                            {index + 1}. {step}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Bottom message */}
                    <div className="text-center mt-6 p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                      <p className="font-pixel text-blue-800 dark:text-blue-200 text-lg mb-2">
                        ⚡ Ready to streamline your design workflow?
                      </p>
                      <p className="font-pixel text-blue-600 dark:text-blue-400 text-sm">
                        Explore sample projects or create your free account to
                        get started
                      </p>
                    </div>
                  </div>

                  <DialogFooter className="flex gap-3">
                    <Button
                      onClick={handleGetStarted}
                      variant="primary"
                      className="flex-1"
                    >
                      Get Started →
                    </Button>
                    <Button
                      onClick={handleViewDemo}
                      variant="secondary"
                      className="flex-1"
                    >
                      Try Live Demo
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            {/* Social proof with portfolio context */}
            <div className="pt-6 flex flex-wrap items-center gap-4">
              <div className="flex -space-x-2">
                {[
                  { name: "M", color: "bg-blue-500" },
                  { name: "S", color: "bg-green-500" },
                  { name: "A", color: "bg-purple-500" },
                  { name: "J", color: "bg-orange-500" },
                ].map((avatar, i) => (
                  <div
                    key={i}
                    className={`w-8 h-8 ${avatar.color} text-white rounded-full flex items-center justify-center text-sm font-bold border-2 border-white dark:border-gray-800`}
                  >
                    {avatar.name}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Retro Computer Display (Right) */}
          <div className="w-full md:w-2/5 relative">
            <RetroTerminal />

            {/* Decorative elements  */}
            <div className="absolute -top-6 -right-6 w-20 h-20 bg-gradient-to-br from-pink-400 to-pink-600 border-4 border-black dark:border-white rounded-lg transform rotate-12 z-[-1] shadow-lg"></div>
            <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-gradient-to-br from-blue-400 to-blue-600 border-4 border-black dark:border-white rounded-full transform -rotate-12 z-[-1] shadow-lg"></div>
          </div>
        </div>
      </div>
    </section>
  );
}
