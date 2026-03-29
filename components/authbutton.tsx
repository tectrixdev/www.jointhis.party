"use client";
import { authClient } from "@/auth-client";
import { SignIn } from "./signin-button";
import { SignOut } from "./signout-button";

export default function Authbutton() {
  const { data, error, refetch, isPending, isRefetching } =
    authClient.useSession();
  const session = data;
  return (
    <div>
      {session ? (
        <>
          <SignOut />
        </>
      ) : (
        <SignIn />
      )}
    </div>
  );
}
