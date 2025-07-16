import { supabase } from "@/lib/supabase/client";
import { ProjectStatus } from "@/lib/types/project";

// Demo project templates for portfolio showcase
export const DEMO_PROJECTS = [
  {
    name: "Mobile Banking App Redesign",
    description:
      "Complete UI/UX redesign for a modern mobile banking application with focus on accessibility and user experience. Includes wireframes, high-fidelity mockups, and interactive prototypes.",
    status: "active" as ProjectStatus,
    files: [
      {
        name: "Banking-App-Wireframes.png",
        description:
          "Low-fidelity wireframes showing user flow and information architecture",
        category: "Wireframes",
      },
      {
        name: "Banking-App-UI-Kit.png",
        description:
          "Complete UI component library with buttons, forms, and navigation elements",
        category: "Design System",
      },
      {
        name: "Banking-App-Screens.png",
        description:
          "High-fidelity mockups of key screens including dashboard, transactions, and profile",
        category: "UI Design",
      },
    ],
    teamMembers: [
      {
        name: "Sarah Chen",
        role: "Lead Designer",
        email: "sarah.chen@designbank.com",
      },
      {
        name: "Mike Rodriguez",
        role: "Developer",
        email: "mike.rodriguez@techbank.com",
      },
    ],
    comments: [
      {
        content:
          "Love the new color scheme! Much more accessible than the previous version.",
        author: "Sarah Chen",
      },
      {
        content:
          "The button spacing looks perfect on mobile. Ready to implement.",
        author: "Mike Rodriguez",
      },
    ],
  },
  {
    name: "E-commerce Platform Dashboard",
    description:
      "Admin dashboard design for an e-commerce platform featuring analytics, inventory management, and order processing. Focused on data visualization and workflow optimization.",
    status: "completed" as ProjectStatus,
    files: [
      {
        name: "Dashboard-Analytics.png",
        description:
          "Sales analytics dashboard with charts, KPIs, and real-time data visualization",
        category: "Dashboard",
      },
      {
        name: "Inventory-Management.png",
        description:
          "Product inventory interface with filtering, search, and bulk operations",
        category: "Management",
      },
      {
        name: "Order-Processing.png",
        description: "Order workflow screens from placement to fulfillment",
        category: "Workflow",
      },
    ],
    teamMembers: [
      {
        name: "Alex Thompson",
        role: "UX Designer",
        email: "alex@ecommstudio.com",
      },
      {
        name: "Jordan Kim",
        role: "Frontend Developer",
        email: "jordan@devteam.com",
      },
      {
        name: "Emily Watson",
        role: "Backend Developer",
        email: "emily@devteam.com",
      },
    ],
    comments: [
      {
        content:
          "The analytics charts are implemented and working perfectly with real data.",
        author: "Jordan Kim",
      },
      {
        content: "API integration complete. All dashboard metrics are live.",
        author: "Emily Watson",
      },
    ],
  },
  {
    name: "Brand Identity & Style Guide",
    description:
      "Complete brand identity system including logo design, typography, color palette, and usage guidelines. Comprehensive style guide for consistent brand application across all touchpoints.",
    status: "active" as ProjectStatus,
    files: [
      {
        name: "Logo-Variations.png",
        description:
          "Primary logo with variations, sizes, and usage guidelines",
        category: "Brand Identity",
      },
      {
        name: "Color-Palette.png",
        description:
          "Brand color system with primary, secondary, and accent colors including hex codes",
        category: "Color System",
      },
      {
        name: "Typography-System.png",
        description:
          "Font selections, hierarchy, and typographic styles for headings and body text",
        category: "Typography",
      },
      {
        name: "Brand-Applications.png",
        description:
          "Logo and brand elements applied to business cards, letterhead, and merchandise",
        category: "Applications",
      },
    ],
    teamMembers: [
      {
        name: "David Park",
        role: "Brand Designer",
        email: "david@brandstudio.com",
      },
      {
        name: "Lisa Chang",
        role: "Marketing Manager",
        email: "lisa@company.com",
      },
    ],
    comments: [
      {
        content:
          "The typography choices perfectly capture our brand personality. Approved!",
        author: "Lisa Chang",
      },
      {
        content:
          "Updated the logo variants based on yesterday's feedback. Ready for final review.",
        author: "David Park",
      },
    ],
  },
];

// Demo team members for realistic collaboration showcase
export const DEMO_TEAM_MEMBERS = [
  {
    name: "Master Miguel",
    email: "miguel@designhandoff.com",
    role: "Owner",
    status: "active",
    joinedAt: "2024-01-15",
    lastActive: "2 minutes ago",
    avatar: null,
  },
  {
    name: "Sarah Chen",
    email: "sarah.chen@designbank.com",
    role: "Designer",
    status: "active",
    joinedAt: "2024-01-20",
    lastActive: "1 hour ago",
    avatar: null,
  },
  {
    name: "Mike Rodriguez",
    email: "mike.rodriguez@techbank.com",
    role: "Developer",
    status: "active",
    joinedAt: "2024-01-22",
    lastActive: "3 hours ago",
    avatar: null,
  },
  {
    name: "Alex Thompson",
    email: "alex@ecommstudio.com",
    role: "Designer",
    status: "active",
    joinedAt: "2024-01-25",
    lastActive: "1 day ago",
    avatar: null,
  },
  {
    name: "Jordan Kim",
    email: "jordan@devteam.com",
    role: "Developer",
    status: "pending",
    joinedAt: null,
    lastActive: null,
    avatar: null,
  },
];

// Function to create demo projects in the database
export async function createDemoProjects(userId: string) {
  try {
    const createdProjects = [];

    for (const projectTemplate of DEMO_PROJECTS) {
      // Create the project
      const { data: project, error: projectError } = await supabase
        .from("projects")
        .insert({
          name: projectTemplate.name,
          description: projectTemplate.description,
          status: projectTemplate.status,
          owner_id: userId,
          created_by: userId,
        })
        .select()
        .single();

      if (projectError) throw projectError;

      createdProjects.push(project);

      // Create file categories for this project
      //   const categories = [
      //     "Wireframes",
      //     "UI Design",
      //     "Design System",
      //     "Dashboard",
      //     "Management",
      //     "Workflow",
      //     "Brand Identity",
      //     "Color System",
      //     "Typography",
      //     "Applications",
      //   ];
      const uniqueCategories = [
        ...new Set(projectTemplate.files.map((f) => f.category)),
      ];

      for (const categoryName of uniqueCategories) {
        const categoryColor = getCategoryColor(categoryName);
        await supabase.from("file_categories").insert({
          project_id: project.id,
          name: categoryName,
          color: categoryColor,
          description: `${categoryName} files and assets`,
        });
      }
    }

    return { success: true, projects: createdProjects };
  } catch (error) {
    console.error("Error creating demo projects:", error);
    return { success: false, error };
  }
}

// Helper function to assign colors to categories
function getCategoryColor(categoryName: string): string {
  const colorMap: { [key: string]: string } = {
    Wireframes: "#6B7280",
    "UI Design": "#EC4899",
    "Design System": "#3B82F6",
    Dashboard: "#10B981",
    Management: "#F59E0B",
    Workflow: "#8B5CF6",
    "Brand Identity": "#EF4444",
    "Color System": "#06B6D4",
    Typography: "#84CC16",
    Applications: "#F97316",
  };

  return colorMap[categoryName] || "#6B7280";
}

// Function to check if demo data already exists
export async function hasDemoData(userId: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from("projects")
      .select("id")
      .eq("owner_id", userId)
      .limit(1);

    if (error) throw error;
    return (data?.length || 0) > 0;
  } catch (error) {
    console.error("Error checking demo data:", error);
    return false;
  }
}

// Function to initialize demo data for new users
export async function initializeDemoData(userId: string) {
  try {
    // Check if user already has projects
    const hasData = await hasDemoData(userId);
    if (hasData) {
      return { success: true, message: "Demo data already exists" };
    }

    // Create demo projects
    const result = await createDemoProjects(userId);

    if (result.success) {
      return {
        success: true,
        message: "Demo data created successfully",
        projects: result.projects,
      };
    } else {
      return {
        success: false,
        error: result.error,
      };
    }
  } catch (error) {
    console.error("Error initializing demo data:", error);
    return { success: false, error };
  }
}
