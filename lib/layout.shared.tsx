import type { BaseLayoutProps } from "fumadocs-ui/layouts/shared";
import { Book, icons } from "lucide-react";
import { Wrench } from "lucide-react";
import { Speech } from "lucide-react";
import { BookOpenText } from "lucide-react";
import { Home } from "lucide-react";
import Image from "next/image";
import Authbutton from "@/components/authbutton";

export function baseOptions(): BaseLayoutProps {
	return {
		themeSwitch: {
			enabled: false, // light theme is currently broken
			mode: "light-dark-system",
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
				text: "Support",
				url: "/discord",
				icon: <Speech />,
			},
			{
				type: "custom",
				children: <Authbutton />,
				secondary: true,
			},
		],
		githubUrl: "https://github.com/tectrixdev/www.jointhis.party",
	};
}
