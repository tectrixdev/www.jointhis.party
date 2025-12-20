import type { BaseLayoutProps } from "fumadocs-ui/layouts/shared";
import { Book, icons } from "lucide-react";
import { Wrench } from "lucide-react";
import { Speech } from "lucide-react";
import { BookOpenText } from "lucide-react";
import { Home } from "lucide-react";
import Image from "next/image";

export function baseOptions(): BaseLayoutProps {
	return {
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
			},
			{
				text: "Documentation",
				url: "/docs",
				icon: <BookOpenText />,
			},
			{
				text: "Tool",
				url: "/tool",
				icon: <Wrench />,
			},
			{
				text: "Support",
				url: "/discord",
				icon: <Speech />,
			},
		],
	};
}
