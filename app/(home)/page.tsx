import Link from "next/link";
import Form from "next/form";
import Image from "next/image";
import { Metadata } from "next";
import { Rubik_Glitch } from "next/font/google";
import { Rubik } from "next/font/google";
import { Card, Cards } from "fumadocs-ui/components/card";
import { House } from "lucide-react";
import { Globe } from "lucide-react";
import { Gamepad } from "lucide-react";
import { Wrench } from "lucide-react";
import { Speech } from "lucide-react";

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
		<main className="bg-[url(/bg.webp)] p-20 flex flex-col justify-start flex-1 bg-no-repeat bg-cover bg-center bg-fixed h-max w-screen pb-5">
			<h1
				className={`${Glitch.className} text-center text-5xl pb-2 drop-shadow-xl md:text-8xl`}
			>
				JoinThisParty
			</h1>
			<h2
				className={`${rubik.className} text-center text-xl drop-shadow-xl md:text-4xl flex flex-row gap-2 self-center truncate pb-10`}
			>
				Guides and documentation to help{" "}
				<p className="font-extrabold text-amber-400 drop-shadow-xl">you</p>{" "}
				self-host!
			</h2>
			<Cards>
				<Card
					className="shadow-2xl backdrop-blur-lg hover:bg-black/40 hover:*:text-white hover:border-white"
					icon={<Globe />}
					href="/docs/web"
					title="Websites"
				>
					Host websites with SSL, cloudflare proxying and the right ports!
				</Card>
				<Card
					className="shadow-2xl backdrop-blur-lg hover:bg-black/40 hover:*:text-white hover:border-white"
					icon={<Gamepad />}
					href="/docs/games"
					title="Games"
				>
					Host your games with the right ports and of course, a free subdomain!
				</Card>
				<Card
					icon={<Gamepad />}
					className="shadow-2xls backdrop-blur-lg hover:bg-black/40 hover:*:text-white hover:border-white"
					href="/docs/minecraft"
					title="Minecraft"
				>
					Get your java domain clean and smooth! We can even remap ports!
				</Card>
				<Card
					icon={<Wrench />}
					className="shadow-2xls backdrop-blur-lg hover:bg-black/40 hover:*:text-white hover:border-white"
					href="/docs/discord-bot"
					title="Discord bot"
				>
					Host your new discord bot! No custom ports or network mapping needed.
				</Card>
				<Card
					className="shadow-2xls backdrop-blur-lg hover:bg-black/40 hover:*:text-white hover:border-white"
					icon={<Wrench />}
					href="/docs/custom"
					title="Custom"
				>
					Host your services with a free subdomain!
				</Card>
				<Card
					className="shadow-2xls backdrop-blur-lg hover:bg-black/40 hover:*:text-white hover:border-white"
					icon={<Wrench />}
					href="/tool"
					title="Explore our subdomain tool!"
				>
					Get your free subdomain here!
				</Card>
			</Cards>
		</main>
	);
}

export const metadata: Metadata = {
	title: "JoinThisParty",
	description: "Start your self-hosting journey here! Free subdomain included!",
	generator: "Next.js",
	applicationName: "jointhis.party",
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
	],
	robots: "index, follow",
	alternates: {
		canonical: "https://www.jointhis.party",
	},
	authors: [{ name: "Joran Hennion" }],
	creator: "Joran Hennion",
	publisher: "Joran Hennion",
	formatDetection: {
		email: false,
		address: false,
		telephone: false,
	},
	metadataBase: new URL("https://www.jointhis.party"),
};
