import { betterAuth } from "better-auth";
import { customSession } from "better-auth/plugins";
import { createPool } from "mysql2/promise";
import { oneTimeToken } from "better-auth/plugins/one-time-token";
import { bearer } from "better-auth/plugins";

export const auth = betterAuth({
  database: createPool({
    host: process.env.MYSQLHOST,
    user: "auth",
    password: process.env.MYSQLPW,
    database: "betterauth",
    timezone: "Z", // Important to ensure consistent timezone values
  }),
  socialProviders: {
    discord: {
      clientId: process.env.AUTH_DISCORD_ID as string,
      clientSecret: process.env.AUTH_DISCORD_SECRET as string,
    },
  },
  plugins: [
    oneTimeToken(),
    customSession(async ({ user, session }) => {
      return {
        user: {
          email: user.email,
          verified: user.emailVerified,
          name: user.name,
          image: user.image,
          id: UserIdFromAvatar(user.image), // Include Discord ID
        },
        session,
      };
    }),
    bearer(),
  ],
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
  image: string | null | undefined;
  id: string | undefined;
};
// There should be 2 types of avatar URLs:
// https://cdn.discordapp.com/embed/avatars/${defaultAvatarNumber}.png
// https://cdn.discordapp.com/avatars/${profile.id}/${profile.avatar}.${format}
export const ValidateDiscordID = /^\d{17,30}$/; // snowflake = unix apparently, that's why newer accounts didn't work.
export function UserIdFromAvatar(avatar: string | null | undefined) {
  if (avatar === null || avatar === undefined) {
    return undefined;
  }
  var userId;
  const url = new URL(avatar);
  if (ValidateDiscordID.test(url.pathname.split("/")[2])) {
    userId = url.pathname.split("/")[2];
  } else if (ValidateDiscordID.test((userId = url.pathname.split("/")[3]))) {
    userId = url.pathname.split("/")[3];
  } else {
    userId = undefined;
  }
  return userId;
}

// sha256 hashes
export const DiscordIdBlacklist = [
  "381b29305da37587918b85e281be41ab9a5c9d4f19b8af8b24d3243a40c1582b",
];
