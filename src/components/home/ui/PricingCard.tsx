import { Text } from "@/components/retroui/Text";
import { Button } from "@/components/retroui/Button";

interface PricingCardProps {
  plan: {
    name: string;
    price: string;
    color: string;
    popular: boolean;
    features: { included: boolean; text: string }[];
    ctaText: string;
    ctaVariant: "primary" | "secondary" | "outline" | "default";
  };
}

export default function PricingCard({ plan }: PricingCardProps) {
  return (
    <div
      className={`w-full md:w-80 bg-white dark:bg-gray-800 border-4 ${plan.popular ? `border-${plan.color}-500` : "border-black dark:border-white"} rounded-lg overflow-hidden shadow-[8px_8px_0px_0px_${plan.popular ? `rgba(236,72,153,1)` : "rgba(0,0,0,1)"}] dark:shadow-[8px_8px_0px_0px_${plan.popular ? `rgba(236,72,153,0.7)` : "rgba(255,255,255,0.5)"}] transform hover:translate-y-[-8px] transition-transform relative`}
    >
      {plan.popular && (
        <div className="absolute top-0 right-0 bg-pink-500 text-white font-pixel px-4 py-1 transform rotate-45 translate-x-8 translate-y-4">
          POPULAR
        </div>
      )}
      <div
        className={`bg-${plan.color}-100 dark:bg-${plan.color}-900 p-4 border-b-4 ${plan.popular ? `border-${plan.color}-500` : "border-black dark:border-white"}`}
      >
        <Text
          as="h3"
          className="text-2xl font-bold font-pixel text-center text-black dark:text-white"
        >
          {plan.name}
        </Text>
      </div>
      <div className="p-6">
        <div className="text-center mb-6">
          <Text
            as="span"
            className="text-5xl font-bold font-pixel text-black dark:text-white"
          >
            ${plan.price}
          </Text>
          <Text as="span" className="text-gray-500 dark:text-gray-400 ml-2">
            / month
          </Text>
        </div>

        <div className="space-y-4 mb-6">
          {plan.features.map((feature, index) => (
            <div key={index} className="flex items-center">
              <span
                className={
                  feature.included
                    ? "text-green-500 mr-2"
                    : "text-gray-400 mr-2"
                }
              >
                {feature.included ? "✓" : "✗"}
              </span>
              <span
                className={
                  feature.included
                    ? "text-black dark:text-white"
                    : "text-gray-400"
                }
              >
                {feature.text}
              </span>
            </div>
          ))}
        </div>

        <Button variant={plan.ctaVariant} className="w-full font-pixel">
          {plan.ctaText}
        </Button>
      </div>
    </div>
  );
}
