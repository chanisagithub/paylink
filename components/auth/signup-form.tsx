"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authCopy } from "@/lib/constants/copy";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { type SignupInput, signupSchema } from "@/lib/validations/auth.schema";

export function SignupForm() {
  // Client component on purpose: signup is an interactive form mutation with optimistic navigation.
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [formError, setFormError] = useState<string | null>(null);

  const form = useForm<SignupInput>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      businessName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = (values: SignupInput) => {
    setFormError(null);

    startTransition(async () => {
      const supabase = createBrowserSupabaseClient();
      const emailRedirectTo = `${window.location.origin}/auth/callback?next=/dashboard`;
      const { data, error } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
        options: {
          emailRedirectTo,
          data: {
            business_name: values.businessName,
          },
        },
      });

      if (error) {
        setFormError(error.message);
        toast.error(authCopy.feedback.signupError);
        return;
      }

      toast.success(
        data.session
          ? authCopy.feedback.signupSuccess
          : authCopy.feedback.signupPendingVerification,
      );

      router.push(data.session ? "/dashboard" : "/login");
      router.refresh();
    });
  };

  return (
    <form className="space-y-5" onSubmit={form.handleSubmit(onSubmit)}>
      <div className="space-y-2">
        <Label htmlFor="signup-business">
          {authCopy.fields.businessName.label}
        </Label>
        <Input
          id="signup-business"
          placeholder={authCopy.fields.businessName.placeholder}
          autoComplete="organization"
          {...form.register("businessName")}
        />
        {form.formState.errors.businessName ? (
          <p className="text-sm text-rose-400">
            {form.formState.errors.businessName.message}
          </p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="signup-email">{authCopy.fields.email.label}</Label>
        <Input
          id="signup-email"
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

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="signup-password">{authCopy.fields.password.label}</Label>
          <Input
            id="signup-password"
            type="password"
            placeholder={authCopy.fields.password.placeholder}
            autoComplete="new-password"
            {...form.register("password")}
          />
          {form.formState.errors.password ? (
            <p className="text-sm text-rose-400">
              {form.formState.errors.password.message}
            </p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="signup-confirm">
            {authCopy.fields.confirmPassword.label}
          </Label>
          <Input
            id="signup-confirm"
            type="password"
            placeholder={authCopy.fields.confirmPassword.placeholder}
            autoComplete="new-password"
            {...form.register("confirmPassword")}
          />
          {form.formState.errors.confirmPassword ? (
            <p className="text-sm text-rose-400">
              {form.formState.errors.confirmPassword.message}
            </p>
          ) : null}
        </div>
      </div>

      {formError ? (
        <Card className="border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
          {formError}
        </Card>
      ) : null}

      <Button className="w-full" size="lg" disabled={isPending}>
        {isPending ? authCopy.actions.creatingAccount : authCopy.actions.signup}
      </Button>
    </form>
  );
}
