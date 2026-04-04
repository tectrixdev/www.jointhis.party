import { Metadata } from "next";
import { baseUrl } from "@/lib/metadata";
import { Rubik_Glitch } from "next/font/google";
import { Rubik } from "next/font/google";
import { MainHome } from "@/components/main";
import "ldrs/react/Zoomies.css";
import { Manager } from "@/components/ToolInput";
import { auth } from "@/auth";
import { headers } from "next/headers";
import TokenViewer from "@/components/viewtoken";
import { Toaster } from "react-hot-toast";

const Glitch = Rubik_Glitch({
  subsets: ["latin"],
  weight: ["400"],
  style: ["normal"],
});

const rubik = Rubik({
  subsets: ["latin"],
  weight: ["400"],
  style: ["normal"],
});

interface Props {
  children: React.ReactNode;
  name: string;
  className?: string;
}

export function Dash({ children, name, className }: Props) {
  return (
    <>
      <h2
        className={`${rubik.className} my-1 flex w-4/5 flex-row gap-2 self-center truncate rounded-xl bg-black/50 p-5 text-left text-xl text-white underline underline-offset-10 drop-shadow-xl backdrop-blur-xl md:text-4xl`}
      >
        {name}
      </h2>
      <div
        className={`mx-auto flex min-h-52 w-4/5 rounded-xl bg-black/60 backdrop-blur-lg ${className}`}
      >
        {children}
      </div>
    </>
  );
}

export default async function HomePage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (session?.session?.id) {
    const data = await auth.api.generateOneTimeToken({
      headers: await headers(),
    });
    return (
      <MainHome ClassName="p-10">
        <Toaster />
        <h1
          className={`${Glitch.className} pb-2 text-center text-5xl text-white drop-shadow-xl md:text-8xl`}
        >
          Dashboard
        </h1>
        <Dash name="JoinThis.proxy">
          <TokenViewer token={data.token} />
        </Dash>
        <Dash name="JoinThis.party">
          <Manager />
        </Dash>
      </MainHome>
    );
  } else {
    return (
      <MainHome ClassName="p-10">
        <h1
          className={`${Glitch.className} pb-2 text-center text-5xl text-white drop-shadow-xl md:text-8xl`}
        >
          Dashboard
        </h1>
        <Dash
          className="text-bold flex items-center justify-center text-center align-middle text-3xl"
          name="Tunnel(s)"
        >
          <p>Log-in required.</p>
        </Dash>
        <Dash
          className="text-bold flex items-center justify-center text-center align-middle text-3xl"
          name="DNS"
        >
          <p>Log-in required.</p>
        </Dash>
      </MainHome>
    );
  }
}

export const metadata: Metadata = {
  title: "JoinThisParty - Dashboard",
  description: "Manage your records and tunnels here!",
  generator: "Next.js",
  applicationName: "jointhis.party",
  openGraph: {
    images: "/opengraph-image.png",
    url: "/opengraph-image.png",
  },
  keywords: [
    "Free DNS hosting",
    "DNS record management",
    "Manage DNS records",
    "Custom DNS configuration",
    "SRV record management",
    "Free SRV records",
    "Subdomain management dashboard",
    "Manage subdomains",
    "Reverse proxy dashboard",
    "Manage reverse proxy",
    "Reverse proxy configuration",
    "HTTP/HTTPS proxy management",
    "Port forwarding setup",
    "Configure port forwarding",
    "Self-hosting dashboard",
    "Game server management",
    "Free domain management",
    "Domain records dashboard",
    "JoinThisParty dashboard",
  ],
  robots: "index, follow",
  alternates: {
    canonical: "https://www.jointhis.party/dash",
  },
  authors: [{ name: "Joran Hennion" }],
  creator: "Joran Hennion",
  publisher: "Joran Hennion",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(baseUrl),
};
