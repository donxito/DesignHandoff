import { Text } from "@/components/retroui/Text";
import { Avatar } from "@/components/retroui/Avatar";

interface TestimonialCardProps {
  testimonial: {
    name: string;
    role: string;
    initials: string;
    content: string;
    color: string;
    buttonText: string;
  };
  isOffset?: boolean;
}

export default function TestimonialCard({
  testimonial,
  isOffset = false,
}: TestimonialCardProps) {
  return (
    <div className={`relative ${isOffset ? "mt-12 md:mt-24" : ""}`}>
      <div
        className={`absolute inset-0 bg-${testimonial.color}-400 rounded-lg transform ${isOffset ? "-rotate-2" : "rotate-2"} z-0`}
      ></div>
      <div className="relative z-10 bg-white dark:bg-gray-800 border-4 border-black dark:border-white p-6 rounded-lg shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,0.5)]">
        <div className="flex items-start mb-4">
          <Avatar className="mr-4 w-16 h-16">
            <Avatar.Fallback className={`bg-${testimonial.color}-400`}>
              {testimonial.initials}
            </Avatar.Fallback>
          </Avatar>
          <div>
            <Text
              as="h4"
              className="text-xl font-bold font-pixel text-black dark:text-white"
            >
              {testimonial.name}
            </Text>
            <Text as="p" className="text-gray-600 dark:text-gray-300">
              {testimonial.role}
            </Text>
          </div>
        </div>
        <div
          className={`font-pixel text-black dark:text-white mb-4 p-4 bg-${testimonial.color}-100 dark:bg-${testimonial.color}-900/30 border-2 border-black dark:border-white rounded`}
        >
          <p className="leading-relaxed typing-effect">
            &ldquo;{testimonial.content}&rdquo;
          </p>
        </div>
        <div className="flex justify-end">
          <Text
            as="p"
            className={`text-sm font-pixel text-${testimonial.color}-500`}
          >
            {testimonial.buttonText}
          </Text>
        </div>
      </div>
    </div>
  );
}
