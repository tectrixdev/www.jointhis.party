import { Metadata } from "next";
import { Rubik_Glitch } from "next/font/google";
import { Rubik } from "next/font/google";
import { Card, Cards } from "fumadocs-ui/components/card";
import { Globe } from "lucide-react";
import { Gamepad } from "lucide-react";
import { Wrench } from "lucide-react";
import { ServerCog } from "lucide-react";
import { MainHome } from "@/components/main";
import { Server } from "lucide-react";

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
	const cardClassName = `shadow-2xl backdrop-blur-lg hover:*:text-black dark:hover:bg-black/40 hover:bg-white/40 dark:hover:*:text-white dark:hover:border-white`;
	return (
		<MainHome ClassName="p-10 md:p-20">
			<h1
				className={`${Glitch.className} text-white text-center text-4xl pb-2 drop-shadow-xl md:text-8xl`}
			>
				JoinThisParty
			</h1>
			<h2
				className={`${rubik.className} text-white text-center text-md drop-shadow-xl md:text-4xl flex flex-row gap-2 self-center truncate pb-10`}
			>
				Guides and documentation to help{" "}
				<p className="font-extrabold text-amber-400 drop-shadow-xl">you</p>{" "}
				self-host!
			</h2>
			<Cards>
				<Card
					className={cardClassName}
					icon={<Server />}
					href="/docs/aternos"
					title="Aternos"
				>
					Get a nice and clean .jointhis.party subdomain for Aternos hosted
					servers!
				</Card>
				<Card
					className={cardClassName}
					icon={<ServerCog />}
					href="/docs/embotic"
					title="Embotic"
				>
					Get a nice and clean .jointhis.party subdomain for Embotic hosted
					servers!
				</Card>
				<Card
					className={cardClassName}
					icon={<Globe />}
					href="/docs/web"
					title="Websites"
				>
					Host websites with SSL, cloudflare proxying and the right ports!
				</Card>
				<Card
					className={cardClassName}
					icon={<Gamepad />}
					href="/docs/games"
					title="Games"
				>
					Host your games with the right ports and of course, a free subdomain!
				</Card>
				<Card
					className={cardClassName}
					icon={<Gamepad />}
					href="/docs/minecraft"
					title="Minecraft"
				>
					Get your java domain clean and smooth! We can even remap ports!
				</Card>
				<Card
					className={cardClassName}
					icon={<Wrench />}
					href="/docs/discord-bot"
					title="Discord bot"
				>
					Host your new discord bot! No custom ports or network mapping needed.
				</Card>
				<Card
					className={cardClassName}
					icon={<Wrench />}
					href="/docs/custom"
					title="Custom"
				>
					Host your services with a free subdomain!
				</Card>
				<Card
					className={cardClassName}
					icon={<Wrench />}
					href="/tool"
					title="Explore our subdomain tool!"
				>
					Get your free subdomain here!
				</Card>
			</Cards>
		</MainHome>
	);
}

export const metadata: Metadata = {
	title: "JoinThisParty",
	description: "Start your self-hosting journey here! Free subdomain included!",
	generator: "Next.js",
	applicationName: "jointhis.party",
	openGraph: {
		images: "/opengraph-image.png",
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
