import { Metadata } from "next";
import { Rubik_Glitch } from "next/font/google";
import { Rubik } from "next/font/google";
import { Toaster } from "react-hot-toast";
import { MainHome } from "@/components/main";
import AuthbuttonExtended from "@/components/authbuttonextended";
import { Form, Manager } from "@/components/ToolInput";
import { baseUrl } from "@/lib/metadata";

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

export default function HomePage() {
  return (
    <MainHome ClassName="p-10">
      <Toaster />
      <h1
        className={`${Glitch.className} pb-2 text-center text-5xl text-white drop-shadow-xl md:text-8xl`}
      >
        Subdomain configurator
      </h1>
      <h2
        className={`${rubik.className} flex flex-row gap-2 self-center truncate pb-10 text-center text-xl text-white drop-shadow-xl md:text-4xl`}
      >
        Get your{" "}
        <p className="font-extrabold text-amber-400 drop-shadow-xl">
          free subdomain
        </p>{" "}
        here!
      </h2>
      <AuthbuttonExtended /> {/* quickly logging in on mobile */}
      <div className="flex w-full flex-col items-center gap-2 self-center">
        <div className="rounded-xl bg-white/50 backdrop-blur-xl md:w-5/6 dark:bg-black/50">
          <Form />
        </div>
        <div className="rounded-xl bg-white/50 backdrop-blur-xl md:w-5/6 dark:bg-black/50">
          <Manager />
        </div>
      </div>
    </MainHome>
  );
}

export const metadata: Metadata = {
  title: "JoinThisParty - Subdomain Tool",
  description: "Create your free subdomain now!",
  generator: "Next.js",
  applicationName: "jointhis.party",
  openGraph: {
    images: "/opengraph-image.png",
    url: "/opengraph-image.png",
  },
  keywords: [
    "Subdomain manager",
    "DNS subdomain management",
    "Create subdomains",
    "Manage subdomains",
    "Free subdomain creation",
    "TecTrix subdomain manager",
    "Subdomain configuration",
    "Minecraft subdomain setup",
    "SRV record manager",
    "Free SRV records",
    "Configure DNS records",
    "Subdomain routing",
    "Port forwarding with subdomains",
    "Reverse proxy subdomains",
  ],
  robots: "index, follow",
  alternates: {
    canonical: "https://www.jointhis.party/tool",
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
