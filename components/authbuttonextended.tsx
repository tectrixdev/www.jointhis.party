import { auth } from "@/auth";
import { signIn } from "@/auth";

export default async function AuthbuttonExtended() {
  const session = await auth();
  return session ? null : (
    <form
      className="md:w-5/6 mb-5 w-full flex md:hidden justify-center self-center"
      action={async () => {
        "use server";
        await signIn("discord");
      }}
    >
      <button
        type="submit"
        className="-mt-2.5 w-full cursor-pointer rounded-md border-b border-amber-500 bg-amber-400 px-4 py-2 font-bold text-black [box-shadow:0_5px_0_0_#fd9a00,0_10px_0_0_#fd9a00] transition-all duration-150 select-none active:translate-y-2 active:border-b-0 active:[box-shadow:0_0px_0_0_#fd9a00,0_0px_0_0_#fd9a00]"
      >
        Login
      </button>
    </form>
  );
}
