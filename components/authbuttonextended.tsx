import { auth } from "@/auth";
import { signIn } from "@/auth";

export default async function AuthbuttonExtended() {
	const session = await auth();
	return session ? null : (
		<div
			className={`re m-2 flex w-full cursor-pointer flex-row gap-3 self-center rounded-lg border border-white bg-black/25 p-2 text-xl backdrop-blur-lg md:hidden`}
		>
			<form
				className="w-full"
				action={async () => {
					"use server";
					await signIn("discord");
				}}
			>
				<button
					type="submit"
					className="hover:text-fd-accent-foreground w-full px-2 py-2 text-center text-white"
				>
					Sign in
				</button>
			</form>
		</div>
	);
}
