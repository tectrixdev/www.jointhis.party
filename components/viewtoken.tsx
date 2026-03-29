"use client";
import { DynamicCodeBlock } from "fumadocs-ui/components/dynamic-codeblock";
import { useState } from "react";
import { Callout } from "fumadocs-ui/components/callout";

interface Props {
  token: string;
}

export default function TokenViewer({ token }: Props) {
  const [Token, SetToken] = useState("");
  return (
    <div className="flex h-full w-full flex-col gap-5 p-5 pb-0">
      <h2>Your authentication token for authenticating the CLI:</h2>
      <DynamicCodeBlock lang="dotenv" code={Token} />
      <button
        className="h-16 cursor-pointer rounded-md border-b border-amber-500 bg-amber-400 px-4 py-2 font-bold text-black [box-shadow:0_10px_0_0_#fd9a00,0_15px_0_0_#fd9a00] transition-all duration-150 select-none active:translate-y-2 active:border-b-0 active:[box-shadow:0_0px_0_0_#fd9a00,0_0px_0_0_#fd9a00]"
        onClick={() => (Token == "" ? SetToken(token) : SetToken(""))}
      >
        {Token == "" ? "view token" : "hide token"}
      </button>
      <Callout type="warning" title="Don't share your token!">
        This token is sensitive information and can lead to account compromises
        if shared. Please do not save, or share this token. It is only meant for
        authenticating the CLI. Tokens invalidate automatically after 3 minutes.
      </Callout>
    </div>
  );
}
