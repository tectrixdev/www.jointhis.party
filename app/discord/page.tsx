import { Metadata } from "next";
import { Rubik_Glitch } from "next/font/google";
import { Rubik } from "next/font/google";
import { MainHome } from "@/components/main";
import { baseUrl } from "@/lib/metadata";
import Link from "fumadocs-core/link";
import { Zoomies } from "ldrs/react";
import "ldrs/react/Zoomies.css";

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
    <MainHome ClassName="p-10"><div className="flex flex-col gap-10 bg-black/50 backdrop-blur-lg rounded-xl py-100 m-auto items-center h-full w-full justify-center">
      <h1 className={`${Glitch.className} md:text-4xl w-full text-3xl text-center`}>Redirecting you to the jointhis.party discord...</h1>
      <Zoomies color="white" size={250} />
    <Link className="p-3 font-bold rounded-xl bg-white text-black" href="https://discord.com/invite/qFzhp9pCtc">Click here if you're not getting redirected.</Link></div>
    </MainHome>
  );
}

export const metadata: Metadata = {
  title: "JoinThisParty - Discord",
  description: "Join the JoinThisParty discord here!",
  generator: "Next.js",
  applicationName: "jointhis.party",
  openGraph: {
    images: "/opengraph-image.png",
    url: "/opengraph-image.png",
  },
  keywords: [
    "Free domain",
    "Free subdomain",
    "Self hosting",
    "TecTrix",
    "Self hosting guides",
    "self hosting minecraft server",
    "minecraft self hosting",
    "minecraft subdomain",
    "Free srv record",
    "How to self host",
    "How to port forward",
    "How to use a reverse proxy",
    "JoinThisParty discord",
  ],
  robots: "index, follow",
  alternates: {
    canonical: "https://www.jointhis.party/discord",
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
