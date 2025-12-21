import { signIn } from "@/auth";

export function SignIn() {
	return (
		<form
			action={async () => {
				"use server";
				await signIn();
			}}
		>
			<button
				type="submit"
				className="text-fd-muted-foreground hover:text-fd-accent-foreground px-8 py-2"
			>
				Sign in
			</button>
		</form>
	);
}
