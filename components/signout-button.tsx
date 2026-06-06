"use client";
import { authClient } from "@/auth-client";
import { LogOut } from "lucide-react";
import toast from "react-hot-toast";

export function SignOut() {
  return (
    <form
      action={async () => {
        const { data, error } = await authClient.signOut();
        if (error?.status == 429) {
          console.error("You are being rate-limited, try again in one minute.");
          toast.error("You are being rate-limited, try again in one minute.");
        }
      }}
    >
      <button
        type="submit"
        className="text-fd-muted-foreground hover:bg-fd-accent/50 hover:text-fd-accent-foreground/80 data-[active=true]:bg-fd-primary/10 data-[active=true]:text-fd-primary relative flex w-full flex-row items-center gap-2 rounded-lg p-2 text-start wrap-anywhere transition-colors hover:transition-none data-[active=true]:hover:transition-colors [&_svg]:size-4 [&_svg]:shrink-0"
      >
        <LogOut strokeWidth={2} width={16} height={16} />
        Sign Out
      </button>
    </form>
  );
}
