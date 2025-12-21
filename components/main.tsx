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
			className={`bg-[url(/bg.webp)] flex flex-col justify-start flex-1 bg-no-repeat bg-cover overflow-hidden bg-center bg-fixed h-max w-screen pb-5 ${ClassName}`}
		>
			{children}
		</main>
	);
};
