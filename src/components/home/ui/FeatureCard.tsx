import { Text } from "@/components/retroui/Text";
import { Button } from "@/components/retroui/Button";

interface FeatureCardProps {
  feature: {
    title: string;
    description: string;
    icon: React.ReactNode;
    color: string;
  };
  activeFeature: number;
}

export default function FeatureCard({
  feature,
  activeFeature,
}: FeatureCardProps) {
  return (
    <div className="bg-white dark:bg-gray-800 border-4 border-black dark:border-white p-6 rounded-lg shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,0.5)] transform hover:translate-y-[-8px] transition-transform duration-300">
      <div
        className={`w-16 h-16 rounded-full bg-${feature.color}-400 border-4 border-black flex items-center justify-center mb-4`}
      >
        {feature.icon}
      </div>
      <Text
        as="h3"
        className="text-2xl font-bold font-pixel mb-3 text-black dark:text-white"
      >
        {feature.title}
      </Text>
      <Text className="text-black dark:text-white">{feature.description}</Text>
      <Button
        className="mt-4 w-full"
        variant={
          activeFeature === 0
            ? "primary"
            : activeFeature === 1
              ? "secondary"
              : "default"
        }
      >
        Learn More
      </Button>
    </div>
  );
}
