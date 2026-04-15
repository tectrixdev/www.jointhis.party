import type { BaseLayoutProps } from "fumadocs-ui/layouts/shared";
import { Gitlab, Wrench } from "lucide-react";
import { Speech } from "lucide-react";
import { BookOpenText } from "lucide-react";
import { Home } from "lucide-react";
import Image from "next/image";
import Authbutton from "@/components/authbutton";
import { LayoutDashboard } from "lucide-react";
import { baseUrl } from "./metadata";
import GitLab from "@/components/gitlabIcon";

export function baseOptions(): BaseLayoutProps {
  return {
    themeSwitch: {
      enabled: true,
      mode: "light-dark",
    },
    nav: {
      title: (
        <>
          <Image
            src="/favicon.ico"
            alt="JoinThisParty"
            width={32}
            height={32}
            priority
            className="rounded-lg"
          />
          <p>JoinThisParty</p>
        </>
      ),
      enabled: true,
    },
    links: [
      {
        text: "Home",
        url: "/",
        icon: <Home />,
        on: "menu",
      },
      {
        text: "Tool",
        url: "/tool",
        icon: <Wrench />,
      },
      {
        text: "Documentation",
        url: "/docs",
        icon: <BookOpenText />,
      },
      {
        text: "Dashboard",
        url: "/dash",
        icon: <LayoutDashboard />,
      },
      {
        text: "Support",
        url: `${baseUrl}/discord`,
        // Marking as external should trigger cloudflare redirect.
        icon: <Speech />,
      },
      {
        type: "custom",
        children: <Authbutton />,
        secondary: true,
      },
      {
        type: "icon",
        label: "GitLab",
        text: "GitLab",
        url: "https://gitlab.com/tectrixdev/www.jointhis.party",
        icon: <GitLab />,
      },
    ],
  };
}
