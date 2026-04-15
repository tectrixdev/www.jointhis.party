import { Metadata } from "next";
import { Rubik_Glitch } from "next/font/google";
import { Rubik } from "next/font/google";
import { MainHome } from "@/components/main";
import AuthbuttonExtended from "@/components/authbuttonextended";
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

export default function LoginPage() {
  return (
    <MainHome ClassName="p-10">
      <div className="flex h-screen w-screen flex-col items-center justify-center gap-10 bg-black/50 p-10 backdrop-blur-lg md:p-0">
        <h1
          className={`${Glitch.className} w-full text-center text-3xl md:text-4xl`}
        >
          Login
        </h1>
        <p className={`${rubik.className} text-center text-white`}>
          Sign in with Discord
        </p>
        <AuthbuttonExtended />
      </div>
    </MainHome>
  );
}

export const metadata: Metadata = {
  title: "JoinThisParty - Login",
  description: "Login to manage your free subdomains",
  generator: "Next.js",
  applicationName: "jointhis.party",
  openGraph: {
    images: "/opengraph-image.png",
    url: "/opengraph-image.png",
  },
  keywords: [
    "Login",
    "Sign in",
    "Discord login",
    "Subdomain management",
    "Free subdomain",
    "JoinThisParty login",
  ],
  robots: "noindex, nofollow",
  alternates: {
    canonical: "https://www.jointhis.party/login",
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
