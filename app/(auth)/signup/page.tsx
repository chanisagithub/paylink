import { AuthShell } from "@/components/auth/auth-shell";
import { SignupForm } from "@/components/auth/signup-form";
import { authCopy } from "@/lib/constants/copy";

export default function SignupPage() {
  return (
    <AuthShell
      eyebrow={authCopy.signup.eyebrow}
      title={authCopy.signup.title}
      description={authCopy.signup.description}
      alternateHref="/login"
      alternateLabel={authCopy.signup.altLabel}
      alternateAction={authCopy.signup.altAction}
    >
      <SignupForm />
    </AuthShell>
  );
}
