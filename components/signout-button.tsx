import { signOut } from "@/auth";

export function SignOut() {
	return (
		<form
			action={async () => {
				"use server";
				await signOut();
			}}
		>
			<button
				type="submit"
				className="text-fd-muted-foreground hover:text-fd-accent-foreground px-8 py-2"
			>
				Sign Out
			</button>
		</form>
	);
}
