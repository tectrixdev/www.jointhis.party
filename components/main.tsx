import React from "react";
import { ClassNameValue } from "tailwind-merge";

interface HomeLayoutProps {
	children: React.ReactNode;
	ClassName?: ClassNameValue;
}

export const MainHome: React.FC<HomeLayoutProps> = ({
	children,
	ClassName,
}) => {
	return (
		<main
			className={`flex h-max w-screen flex-1 flex-col justify-start overflow-hidden bg-[url(/bg.webp)] bg-cover bg-fixed bg-center bg-no-repeat pb-5 ${ClassName}`}
		>
			{children}
		</main>
	);
};
