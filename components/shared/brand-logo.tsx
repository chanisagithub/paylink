import Image from "next/image";

import payLinkLogo from "@/app/assets/Paylink.png";
import { cn } from "@/lib/utils";

type BrandLogoProps = {
  className?: string;
  priority?: boolean;
};

export function BrandLogo({ className, priority = false }: BrandLogoProps) {
  return (
    <Image
      src={payLinkLogo}
      alt="PayLink"
      priority={priority}
      className={cn("h-auto w-36", className)}
    />
  );
}

