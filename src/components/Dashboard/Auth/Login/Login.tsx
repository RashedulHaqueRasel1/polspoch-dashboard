"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();

  // Handle Sign In
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });
      // If API returns "success: trues"
      if (result?.ok) {
        toast.success("Logged in successfully!");
        router.push("/");
      } else {
        toast.error(result?.error || "Login failed. Please try again.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mx-auto container">
      <div className="bg-white rounded-2xl shadow-lg px-8 py-10">
        {/* Heading */}
        <h1 className="text-3xl font-bold text-gray-900">Welcome!</h1>
        <p className="text-gray-500 mt-1 text-sm">
          Manage your orders, track shipments, and configure products easily.
        </p>

        {/* Form */}
        <form>
          <div className="mt-6 space-y-4">
            <div>
              <Label className="text-sm font-medium text-gray-700">
                Email Address
              </Label>
              <Input
                type="email"
                placeholder="hello@example.com"
                className="mt-1 py-5"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <Label className="text-sm font-medium text-gray-700">
                Password
              </Label>

              <div className="relative mt-1">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="********"
                  className="pr-10 py-5"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-gray-500 hover:text-gray-700 cursor-pointer"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between mt-2">
              <div className="flex items-center space-x-2">
                <Checkbox id="remember" />
                <label
                  htmlFor="remember"
                  className="text-sm text-gray-600 cursor-pointer"
                >
                  Remember me
                </label>
              </div>

              <Link
                href={"/forget-password"}
                className="text-sm text-red-600 hover:underline cursor-pointer"
              >
                Forgot password?
              </Link>
            </div>

            <Button
              className="w-full bg-[#8A1B00] hover:bg-[#701600] mt-4 text-white cursor-pointer"
              onClick={handleSignIn}
              disabled={isLoading}
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
