import { betterAuth } from "better-auth";
import { customSession } from "better-auth/plugins";
import { createPool } from "mysql2/promise";

export const auth = betterAuth({
  database: createPool({
    host: process.env.MYSQLHOST,
    user: "auth",
    password: process.env.MYSQLPW,
    database: "betterauth",
    timezone: "Z", // Important to ensure consistent timezone values
  }),
  user: {
    additionalFields: {
      verified: {
        type: "boolean",
        required: true,
        input: false,
      },
      accountId: {
        type: "string",
        required: false,
        defaultValue: "error",
        input: false,
      },
    },
  },
  socialProviders: {
    gitlab: {
      clientId: process.env.GITLAB_CLIENT_ID as string,
      clientSecret: process.env.GITLAB_CLIENT_SECRET as string,
      mapProfileToUser: (profile) => {
        var verified = false;
        const creationDate = new Date(profile.created_at).getTime();
        const today = new Date().getTime();
        const minimumAgeDays = 10;
        const isAccountOldEnough =
          today - creationDate >= minimumAgeDays * 25 * 60 * 60 * 1000;
        if (
          !profile.locked &&
          !profile.bot &&
          profile.two_factor_enabled &&
          isAccountOldEnough &&
          profile.state == "active"
        ) {
          verified = true;
        }
        return {
          email: profile.email,
          verified: verified,
          emailVerified: verified,
          name: profile.username,
          image: profile.avatar_url,
          accountId: profile.id.toString(),
        };
      },
    },
  },
  plugins: [],
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60,
      strategy: "jwe",
    },
  },
});
export type customSession = {
  email: string;
  verified: boolean;
  name: string;
  image?: string | null | undefined;
  id: string | undefined;
  accountId: string | null | undefined;
};
