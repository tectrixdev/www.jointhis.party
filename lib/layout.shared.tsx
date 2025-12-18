import type { BaseLayoutProps } from "fumadocs-ui/layouts/shared";
import { Book, icons } from "lucide-react";
import { Wrench } from "lucide-react";
import { Speech } from "lucide-react";
import { BookOpenText } from "lucide-react";
import { Home } from "lucide-react";

export function baseOptions(): BaseLayoutProps {
	return {
		nav: {
			title: "JoinThis.Party",
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
