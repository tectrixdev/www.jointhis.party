import Link from "next/link";
import Form from "next/form";
import Image from "next/image";
import { Metadata } from "next";

export default function HomePage() {
	return (
		<main className="bg-[url(/bg.webp)] flex flex-col justify-center text-center flex-1 bg-no-repeat bg-cover bg-center bg-fixed h-max w-screen"></main>
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
