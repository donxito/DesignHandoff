import { Text } from "@/components/retroui/Text";
import { Badge } from "@/components/retroui/Badge";
import TestimonialCard from "./ui/TestimonialCard";

export default function TestimonialsSection() {
  const testimonials = [
    {
      name: "Sarah A.",
      role: "UI Designer at TechCorp",
      initials: "SA",
      content:
        "DesignHandoff made our design-to-development process 3x faster! The retro interface is not just fun but incredibly intuitive.",
      color: "pink",
      buttonText: "Press A to continue...",
    },
    {
      name: "Mike J.",
      role: "Frontend Developer at StartApp",
      initials: "MJ",
      content:
        "Pixel-perfect implementation is finally possible! I can extract exact specs and assets without endless back-and-forth with designers.",
      color: "blue",
      buttonText: "Press B to continue...",
    },
  ];

  return (
    <section className="relative z-10 py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <Badge variant="secondary" className="mb-4 inline-block">
            User Stories
          </Badge>
          <Text
            as="h2"
            className="text-4xl font-bold mb-6 font-pixel text-black dark:text-white"
          >
            What Our Users Say
          </Text>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <TestimonialCard
              key={index}
              testimonial={testimonial}
              isOffset={index === 1} // Second testimonial is offset
            />
          ))}
        </div>
      </div>
    </section>
  );
}
