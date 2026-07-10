"use client";
import { DynamicCodeBlock } from "fumadocs-ui/components/dynamic-codeblock";
import { useState, useEffect } from "react";
import { Callout } from "fumadocs-ui/components/callout";
import { Zoomies } from "ldrs/react";
import "ldrs/react/Zoomies.css";
import toast from "react-hot-toast";

export default function TokenViewer() {
  const [Token, SetToken] = useState("");
  const [isPending, setPending] = useState(false);
  async function ToggleToken() {
    if (Token === "") {
      setPending(true);
      try {
        const t = toast.loading("Fetching Token...");
        const res = await fetch("/api/proxy", {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });
        if (res.status == 429) {
          console.error("You are being rate-limited, try again in one minute.");
          toast.error("You are being rate-limited, try again in one minute.");
        } else {
          const data = await res.json();
          if (!res.ok) {
            toast.dismiss(t);
            toast.error(data?.error || "Failed to fetch token.");
          } else {
            toast.dismiss(t);
            SetToken(data.credentials.TOKEN);
          }
        }
      } catch (err: any) {
        toast.error(err?.message || "Network error");
      } finally {
        setPending(false);
      }
    } else {
      SetToken("");
    }
  }
  // TODO: Reference to the setup article here.
  return (
    <div className="flex h-full w-full flex-col gap-5 p-5 pb-0">
      <h2>Your authentication token for connecting to the proxy:</h2>
      <DynamicCodeBlock lang="dotenv" code={Token} />
      <button
        disabled={isPending}
        className="h-16 cursor-pointer rounded-md border-b border-amber-500 bg-amber-400 px-4 py-2 font-bold text-black [box-shadow:0_10px_0_0_#fd9a00,0_15px_0_0_#fd9a00] transition-all duration-150 select-none active:translate-y-2 active:border-b-0 active:[box-shadow:0_0px_0_0_#fd9a00,0_0px_0_0_#fd9a00] disabled:cursor-default"
        onClick={() => ToggleToken()}
      >
        {Token == "" ? "View token" : isPending ? <Zoomies /> : "Hide token"}
      </button>
      <Callout type="warning" title="Don't share your token!">
        This token is sensitive information and can lead to account compromises
        if shared. Please do not share this token! It is only meant for
        authenticating the proxy. Final warning, this token is only meant for
        YOU, and not for anyone else. Our Terms Of Service do not permit
        sharing, and you should not do so.
      </Callout>
    </div>
  );
}
