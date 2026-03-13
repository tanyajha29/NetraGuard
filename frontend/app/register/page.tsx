"use client"

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/components/auth/auth-provider";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const { register } = useAuth();
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/";
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role] = useState("analyst");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register({ full_name: fullName, email, password, role }, next);
      toast({ title: "Account created", description: "Logged in as new user." });
      router.replace(next || "/");
    } catch (err: any) {
      toast({ title: "Registration failed", description: err.message || "Try again", variant: "destructive" });
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-cyber flex items-center justify-center p-4">
      <Card className="w-full max-w-md glass-card border border-border/50">
        <CardHeader className="space-y-2 text-center">
          <CardTitle className="text-2xl font-semibold text-foreground">Create your account</CardTitle>
          <CardDescription>Join the NetraGuard platform</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">Full name</label>
              <Input type="text" required value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Jane Analyst" />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">Email</label>
              <Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">Password</label>
              <Input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Creating..." : "Create account"}
            </Button>
          </form>
          <p className="text-sm text-muted-foreground text-center mt-4">
            Already have an account? <Link href={`/login?next=${encodeURIComponent(next)}`} className="text-primary">Sign in</Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
