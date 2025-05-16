import { Text } from "@/components/retroui/Text";
import { Badge } from "@/components/retroui/Badge";
import PricingCard from "./ui/PricingCard";

type PricingPlan = {
  name: string;
  price: string;
  color: string;
  popular: boolean;
  features: { included: boolean; text: string }[];
  ctaText: string;
  ctaVariant: "primary" | "secondary" | "outline" | "default";
};

export default function PricingSection() {
  const pricingPlans: PricingPlan[] = [
    {
      name: "Starter",
      price: "0",
      color: "blue",
      popular: false,
      features: [
        { included: true, text: "Up to 3 projects" },
        { included: true, text: "Basic file uploading" },
        { included: true, text: "Simple specs" },
        { included: false, text: "Team collaboration" },
      ],
      ctaText: "Get Started",
      ctaVariant: "outline",
    },
    {
      name: "Pro",
      price: "29",
      color: "pink",
      popular: true,
      features: [
        { included: true, text: "Unlimited projects" },
        { included: true, text: "Advanced file management" },
        { included: true, text: "Complete spec extraction" },
        { included: true, text: "Team collaboration (5 seats)" },
      ],
      ctaText: "Get Pro",
      ctaVariant: "primary",
    },
    {
      name: "Enterprise",
      price: "99",
      color: "yellow",
      popular: false,
      features: [
        { included: true, text: "Everything in Pro" },
        { included: true, text: "Unlimited team members" },
        { included: true, text: "Advanced analytics" },
        { included: true, text: "Priority support" },
      ],
      ctaText: "Contact Sales",
      ctaVariant: "outline",
    },
  ];

  return (
    <section className="relative z-10 py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <Badge variant="secondary" className="mb-4 inline-block">
            Choose Your Plan
          </Badge>
          <Text
            as="h2"
            className="text-4xl font-bold mb-6 font-pixel text-black dark:text-white"
          >
            Simple, Transparent Pricing
          </Text>
          <Text
            as="p"
            className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto"
          >
            No hidden fees or complicated tiers. Just pick what works for your
            team.
          </Text>
        </div>

        <div className="flex flex-wrap justify-center gap-8">
          {pricingPlans.map((plan, index) => (
            <PricingCard key={index} plan={plan} />
          ))}
        </div>
      </div>
    </section>
  );
}
