import { signIn } from "@/auth";
import { LogIn } from "lucide-react";

export function SignIn() {
	return (
		<form
			action={async () => {
				"use server";
				await signIn("discord");
			}}
		>
			<button
				type="submit"
				className="relative flex flex-row items-center gap-2 rounded-lg p-2 text-start text-fd-muted-foreground wrap-anywhere [&_svg]:size-4 [&_svg]:shrink-0 transition-colors hover:bg-fd-accent/50 hover:text-fd-accent-foreground/80 hover:transition-none data-[active=true]:bg-fd-primary/10 data-[active=true]:text-fd-primary data-[active=true]:hover:transition-colors w-full"
			>
				<LogIn strokeWidth={2} width={16} height={16} />
				Sign In
			</button>
		</form>
	);
}
