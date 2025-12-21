import Link from "next/link";
import Form from "next/form";
import Image from "next/image";
import { Metadata } from "next";
import { Rubik_Glitch } from "next/font/google";
import { Rubik } from "next/font/google";
import { MainHome } from "@/components/main";
import { createrecord } from "@/components/createrecord";

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
			<h1
				className={`${Glitch.className} text-center text-5xl pb-2 drop-shadow-xl md:text-8xl`}
			>
				Subdomain configurator
			</h1>
			<h2
				className={`${rubik.className} text-center text-xl drop-shadow-xl md:text-4xl flex flex-row gap-2 self-center truncate pb-10`}
			>
				Get your{" "}
				<p className="font-extrabold text-amber-400 drop-shadow-xl">
					free subdomain
				</p>{" "}
				here!
			</h2>
			<Form
				action={createrecord}
				className="flex flex-col gap-4 max-w-2xl mx-auto bg-black/25 backdrop-blur-lg p-10 rounded-lg md:w-2/3 border-white border"
			>
				<div className="flex flex-col gap-2">
					<label htmlFor="name" className="font-semibold">
						Subdomain Name
					</label>
					<input
						type="text"
						id="name"
						name="name"
						required
						placeholder="my-subdomain"
						className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-400"
					/>
				</div>

				<div className="flex flex-col gap-2">
					<label htmlFor="type" className="font-semibold">
						Record Type
					</label>
					<select
						id="type"
						name="type"
						required
						className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-400"
					>
						<option value="">Select a type</option>
						<option value="A">A - IPv4 Address</option>
						<option value="AAAA">AAAA - IPv6 Address</option>
						<option value="CNAME">CNAME - Alias</option>
						<option value="TXT">TXT - Text Record</option>
						<option value="SRV">SRV - Service Record</option>
					</select>
				</div>

				<div className="flex flex-col gap-2">
					<label htmlFor="value" className="font-semibold">
						Value
					</label>
					<input
						type="text"
						id="value"
						name="value"
						required
						placeholder="Enter record value"
						className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-400"
					/>
					<label htmlFor="port" className="font-semibold">
						Port (SRV-only)
					</label>
					<input
						type="number"
						id="port"
						name="port"
						placeholder="Enter port"
						className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-400"
					/>
				</div>

				<button
					type="submit"
					className="px-4 py-2 bg-amber-400 text-black font-bold rounded-md hover:bg-amber-500 transition-colors"
				>
					Create Record
				</button>
			</Form>
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
