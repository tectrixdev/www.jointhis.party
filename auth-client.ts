import { createAuthClient } from "better-auth/react";
import { oneTimeTokenClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
  plugins: [oneTimeTokenClient()],
});
