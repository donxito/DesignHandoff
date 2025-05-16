import ProjectList from "@/components/dashboard/project-list";
import { Text } from "@/components/retroui/Text";
import { Button } from "@/components/retroui/Button";
import Link from "next/link";
import ProtectedRoute from "@/components/auth/protected-route";
import Header from "@/components/layout/header";

export default function ProjectsPage() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-white dark:bg-[#121212] bg-[url('/grid-pattern.svg')] dark:bg-[url('/grid-pattern-dark.svg')]">
        <Header />
        <main className="container mx-auto py-8 px-4">
          <div className="flex justify-between items-center mb-6">
            <Text
              as="h1"
              className="text-3xl font-bold font-pixel text-black dark:text-white text-adaptive"
            >
              Your Projects
            </Text>
            <Link href="/dashboard/project/new">
              <Button variant="primary">Create Project</Button>
            </Link>
          </div>

          <ProjectList />
        </main>
      </div>
    </ProtectedRoute>
  );
}
