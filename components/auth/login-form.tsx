"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authCopy } from "@/lib/constants/copy";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { type LoginInput, loginSchema } from "@/lib/validations/auth.schema";

export function LoginForm() {
  // Client component on purpose: it owns form state, RHF validation, and Supabase auth mutations.
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [formError, setFormError] = useState<string | null>(null);

  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = (values: LoginInput) => {
    setFormError(null);

    startTransition(async () => {
      const supabase = createBrowserSupabaseClient();
      const { error } = await supabase.auth.signInWithPassword(values);

      if (error) {
        setFormError(error.message);
        toast.error(authCopy.feedback.loginError);
        return;
      }

      toast.success(authCopy.feedback.loginSuccess);
      const nextUrl = searchParams.get("next") ?? "/dashboard";
      router.push(nextUrl);
      router.refresh();
    });
  };

  return (
    <form className="space-y-5" onSubmit={form.handleSubmit(onSubmit)}>
      <div className="space-y-2">
        <Label htmlFor="login-email">{authCopy.fields.email.label}</Label>
        <Input
          id="login-email"
          type="email"
          placeholder={authCopy.fields.email.placeholder}
          autoComplete="email"
          {...form.register("email")}
        />
        {form.formState.errors.email ? (
          <p className="text-sm text-rose-400">
            {form.formState.errors.email.message}
          </p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="login-password">{authCopy.fields.password.label}</Label>
        <Input
          id="login-password"
          type="password"
          placeholder={authCopy.fields.password.placeholder}
          autoComplete="current-password"
          {...form.register("password")}
        />
        {form.formState.errors.password ? (
          <p className="text-sm text-rose-400">
            {form.formState.errors.password.message}
          </p>
        ) : null}
      </div>

      {formError ? (
        <Card className="border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
          {formError}
        </Card>
      ) : null}

      <Button className="w-full" size="lg" disabled={isPending}>
        {isPending ? authCopy.actions.loggingIn : authCopy.actions.login}
      </Button>
    </form>
  );
}
