import { auth } from "@/auth";
import { SignIn } from "./signin-button";
import { SignOut } from "./signout-button";
import Image from "next/image";

export default async function Authbutton({ extended }: { extended: boolean }) {
	const session = await auth();
	return (
		<div
			className={
				extended
					? `cursor-pointer bg-black/25 backdrop-blur-lg flex flex-row gap-3 border rounded-lg w-fit p-2 text-xl self-center border-white`
					: ``
			}
		>
			{session ? (
				<>
					{extended ? (
						<Image
							src={session?.user?.image || `/favicon.ico`}
							alt="User profile picture"
							width={24}
							height={24}
							className="rounded-full w-fit h-fit -mr-5"
						/>
					) : null}
					<SignOut />
				</>
			) : (
				<SignIn />
			)}
		</div>
	);
}
