import { betterAuth } from "better-auth";
import { customSession } from "better-auth/plugins";
import { createPool } from "mysql2/promise";
import { oneTimeToken } from "better-auth/plugins/one-time-token";
import { captcha } from "better-auth/plugins";
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
      mapProfileToUser: (profile) => {
        const discordId =
          typeof profile.id === "string" ? BigInt(profile.id) : profile.id;
        return {
          discordId: profile.id,
          emailVerified: profile.verified,
          discordUsername: profile.username,
          discordDiscriminator: profile.discriminator,
          accountCreatedAt: new Date(
            Number(discordId / 4194304n) + 1420070400000,
          ).toISOString(), // Approximate Discord account creation from snowflake
        };
      },
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
          id: (user as any).discordId, // use discordId from database
        },
        session,
      };
    }),
    bearer(),
    captcha({
      provider: "cloudflare-turnstile",
      secretKey: process.env.TURNSTILE_SECRET_KEY!,
    }),
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

export const ValidateDiscordID = /^\d{17,30}$/; // snowflake = unix apparently, that's why newer accounts didn't work.
