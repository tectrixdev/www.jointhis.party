"use client";
import { authClient } from "@/auth-client";

export default function AuthbuttonExtended() {
  const { data, error, refetch, isPending, isRefetching } =
    authClient.useSession();
  const session = data;
  return session ? null : (
    <form
      className="mb-5 flex w-full justify-center self-center md:hidden md:w-5/6"
      action={async () => {
        const { data, error } = await authClient.signIn.social({
          provider: "discord",
        });
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
