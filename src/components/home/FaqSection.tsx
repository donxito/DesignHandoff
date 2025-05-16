import { Text } from "@/components/retroui/Text";
import { Badge } from "@/components/retroui/Badge";
import FaqItem from "./ui/FaqItem";

export default function FaqSection() {
  const faqItems = [
    {
      question: "How does DesignHandoff compare to other tools?",
      answer:
        "DesignHandoff combines the functionality of design handoff tools with a fun, nostalgic interface that makes collaboration enjoyable. We focus on simplicity and delight, not just utility.",
    },
    {
      question: "Can I import files from Figma or Sketch?",
      answer:
        "Yes! DesignHandoff supports direct imports from major design tools including Figma, Sketch, and Adobe XD. Just export your designs and upload them to our platform.",
    },
    {
      question: "How many team members can I add?",
      answer:
        "The Free plan supports 1 user, Pro plan supports up to 5 team members, and Enterprise offers unlimited team collaboration.",
    },
    {
      question: "Is there a trial period for paid plans?",
      answer:
        "Yes, all paid plans include a 14-day free trial with no credit card required. Try before you buy!",
    },
  ];

  return (
    <section className="relative z-10 py-16 md:py-24 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-100/30 to-pink-100/30 dark:from-blue-900/20 dark:to-pink-900/20 transform -skew-y-3 z-0"></div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <Badge variant="primary" className="mb-4 inline-block">
              FAQs
            </Badge>
            <Text
              as="h2"
              className="text-4xl font-bold mb-6 font-pixel text-black dark:text-white"
            >
              Got Questions?
            </Text>
          </div>

          <div className="bg-black border-8 border-gray-800 rounded-xl p-6 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] dark:shadow-[12px_12px_0px_0px_rgba(255,255,255,0.5)]">
            {/* Arcade screen top bar */}
            <div className="flex justify-between items-center mb-4 px-4 py-2 bg-gray-800 border-2 border-gray-700 rounded">
              <div className="font-pixel text-green-400">SELECT A QUESTION</div>
              <div className="font-pixel text-yellow-400">CREDITS: ∞</div>
            </div>

            {/* FAQ items in arcade style */}
            <div className="space-y-4">
              {faqItems.map((faq, index) => (
                <FaqItem
                  key={index}
                  question={faq.question}
                  answer={faq.answer}
                />
              ))}
            </div>

            {/* Arcade cabinet controls */}
            <div className="mt-8 flex justify-center items-center gap-8">
              <div className="flex gap-2">
                <div className="w-10 h-10 bg-gray-800 border-2 border-gray-700 rounded-full flex items-center justify-center font-pixel text-white">
                  ↑
                </div>
              </div>
              <div className="flex gap-2">
                <div className="w-10 h-10 bg-gray-800 border-2 border-gray-700 rounded-full flex items-center justify-center font-pixel text-white">
                  ←
                </div>
                <div className="w-10 h-10 bg-gray-800 border-2 border-gray-700 rounded-full flex items-center justify-center font-pixel text-white">
                  ↓
                </div>
                <div className="w-10 h-10 bg-gray-800 border-2 border-gray-700 rounded-full flex items-center justify-center font-pixel text-white">
                  →
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-12 h-12 bg-red-500 border-2 border-red-700 rounded-full flex items-center justify-center font-pixel text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,0.3)]">
                  A
                </div>
                <div className="w-12 h-12 bg-green-500 border-2 border-green-700 rounded-full flex items-center justify-center font-pixel text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,0.3)]">
                  B
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
