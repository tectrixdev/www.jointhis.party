import { auth } from "@/auth";
import { SignIn } from "./signin-button";
import { SignOut } from "./signout-button";

export default async function Authbutton() {
  const session = await auth();
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
