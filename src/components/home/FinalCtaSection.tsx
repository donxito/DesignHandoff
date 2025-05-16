import Link from "next/link";
import { Text } from "@/components/retroui/Text";
import { Badge } from "@/components/retroui/Badge";
import { Button } from "@/components/retroui/Button";

export default function FinalCtaSection() {
  return (
    <section className="relative z-10 py-16 md:py-20 overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto">
          <div className="bg-white dark:bg-gray-800 border-4 border-black dark:border-white rounded-lg p-8 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] dark:shadow-[12px_12px_0px_0px_rgba(255,255,255,0.5)] relative">
            {/* Decorative elements */}
            <div className="absolute -top-6 -right-6 w-24 h-24 bg-yellow-400 border-4 border-black rounded-full transform rotate-12 z-[-1]"></div>
            <div className="absolute -bottom-6 -left-6 w-20 h-20 bg-pink-400 border-4 border-black rounded-full transform -rotate-12 z-[-1]"></div>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
              <div className="md:w-2/3">
                <Badge
                  variant="warning"
                  className="mb-4 inline-block text-black"
                >
                  Final Boss Level
                </Badge>
                <Text
                  as="h2"
                  className="text-3xl md:text-4xl font-bold mb-4 font-pixel text-black dark:text-white"
                >
                  Ready to Transform Your Design Workflow?
                </Text>
                <Text
                  as="p"
                  className="text-lg text-gray-600 dark:text-gray-300"
                >
                  Join DesignHandoff today and revolutionize how your team
                  collaborates. No more pixel-hunting or spec confusion!
                </Text>
              </div>

              <div className="md:w-1/3 flex flex-col gap-4">
                <Link href="/auth/signup" className="no-underline">
                  <Button
                    variant="primary"
                    size="lg"
                    className="w-full font-pixel text-lg py-4 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:shadow-[6px_6px_0px_0px_rgba(255,255,255,0.5)]"
                  >
                    Start Free Trial →
                  </Button>
                </Link>
                <Link href="/auth/login" className="no-underline">
                  <Button
                    variant="outline"
                    className="w-full font-pixel shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:shadow-[6px_6px_0px_0px_rgba(255,255,255,0.5)]"
                  >
                    Log In
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
