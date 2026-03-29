"use client";
import { authClient } from "@/auth-client";
import { LogIn } from "lucide-react";
import { usePathname } from "fumadocs-core/framework";
import { baseUrl } from "@/lib/metadata";

export function SignIn() {
  const callback = `${baseUrl}${usePathname()}`;
  return (
    <form
      action={async () => {
        const { data, error } = await authClient.signIn.social({
          provider: "discord",
          callbackURL: callback,
        });
      }}
    >
      <button
        type="submit"
        className="text-fd-muted-foreground hover:bg-fd-accent/50 hover:text-fd-accent-foreground/80 data-[active=true]:bg-fd-primary/10 data-[active=true]:text-fd-primary relative flex w-full flex-row items-center gap-2 rounded-lg p-2 text-start wrap-anywhere transition-colors hover:transition-none data-[active=true]:hover:transition-colors [&_svg]:size-4 [&_svg]:shrink-0"
      >
        <LogIn strokeWidth={2} width={16} height={16} />
        Sign In
      </button>
    </form>
  );
}
