import { auth } from "@/auth";
import { signIn } from "@/auth";

export default async function AuthbuttonExtended() {
	const session = await auth();
	return session ? null : (
		<div
			className={`cursor-pointer re md:hidden bg-black/25 backdrop-blur-lg flex flex-row gap-3 border rounded-lg w-full p-2 m-2 text-xl self-center border-white`}
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
					className="text-white hover:text-fd-accent-foreground px-2 py-2 text-center w-full"
				>
					Sign in
				</button>
			</form>
		</div>
	);
}
