import type { BaseLayoutProps } from "fumadocs-ui/layouts/shared";
import { icons } from "lucide-react";
import { Wrench } from "lucide-react";
import { Speech } from "lucide-react";

export function baseOptions(): BaseLayoutProps {
	return {
		nav: {
			title: "JoinThis.Party",
		},
		links: [
			{
				text: "Tool",
				url: "/tool",
				icon: <Wrench />,
			},
			{
				text: "Support / Discord",
				url: "/discord",
				icon: <Speech />,
			},
		],
	};
}
