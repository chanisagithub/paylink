import { Suspense } from "react";

import { AuthShell } from "@/components/auth/auth-shell";
import { LoginForm } from "@/components/auth/login-form";
import { authCopy } from "@/lib/constants/copy";

export default function LoginPage() {
  return (
    <AuthShell
      eyebrow={authCopy.login.eyebrow}
      title={authCopy.login.title}
      description={authCopy.login.description}
      alternateHref="/signup"
      alternateLabel={authCopy.login.altLabel}
      alternateAction={authCopy.login.altAction}
    >
      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>
    </AuthShell>
  );
}
