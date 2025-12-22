import Link from "next/link";
import Form from "next/form";
import Image from "next/image";
import { Metadata } from "next";
import { Rubik_Glitch } from "next/font/google";
import { Rubik } from "next/font/google";
import { MainHome } from "@/components/main";
import RecordForm from "@/components/RecordForm";
import SubdomainManagerClient from "@/components/SubdomainManagerClient";
import { Toaster } from "react-hot-toast";
import AuthbuttonExtended from "@/components/authbuttonExtended";

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
				className={`${Glitch.className} text-white text-center text-5xl pb-2 drop-shadow-xl md:text-8xl`}
			>
				Subdomain configurator
			</h1>
			<h2
				className={`${rubik.className} text-white text-center text-xl drop-shadow-xl md:text-4xl flex flex-row gap-2 self-center truncate pb-10`}
			>
				Get your{" "}
				<p className="font-extrabold text-amber-400 drop-shadow-xl">
					free subdomain
				</p>{" "}
				here!
			</h2>
			<AuthbuttonExtended />
			<RecordForm />
			<SubdomainManagerClient />
		</MainHome>
	);
}

export const metadata: Metadata = {
	title: "JoinThisParty - Subdomain Tool",
	description: "Create your free subdomain now!",
	generator: "Next.js",
	applicationName: "jointhis.party",
	keywords: [
		"Free domain",
		"Free subdomain",
		"Self hosting",
		"TecTrix",
		"Self hosting",
		"Self hosting subdomain",
		"Free subdomain",
		"minecraft subdomain",
		"Free srv record",
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
	metadataBase: new URL("https://www.jointhis.party/tool"),
};
