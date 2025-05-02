import { AuthForm } from "@/components/auth/auth-form";

export default function LoginPage() {
  return (
    <div className="flex h-screen">
      <div className="hidden lg:flex lg:w-1/2 relative bg-blue-600">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-blue-600 opacity-90"></div>
        <div className="relative z-10 flex items-center justify-center w-full h-full">
          <div className="max-w-md px-8 text-white">
            <h1 className="text-4xl font-bold mb-6">DesignHandoff</h1>
            <p className="text-xl">
              Streamline your design to development workflow with our
              collaborative platform.
            </p>
          </div>
        </div>
      </div>
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4">
        <AuthForm mode="login" />
      </div>
    </div>
  );
}
