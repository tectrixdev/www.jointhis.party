import NextAuth from "next-auth";
import Discord from "next-auth/providers/discord";

// There should be 2 types of avatar URLs:
// https://cdn.discordapp.com/embed/avatars/${defaultAvatarNumber}.png
// https://cdn.discordapp.com/avatars/${profile.id}/${profile.avatar}.${format}
export function UserIdFromAvatar(avatar: string) {
  var userId;
  const url = new URL(avatar);
  const ValidateDiscordID = /^\d{17,20}$/;

  if (ValidateDiscordID.test(url.pathname.split("/")[2])) {
    userId = url.pathname.split("/")[2];
  } else if (ValidateDiscordID.test((userId = url.pathname.split("/")[3]))) {
    userId = url.pathname.split("/")[3];
  } else {
    userId = undefined;
  }
  return userId;
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [Discord],
  callbacks: {
    async session({ session }) {
      if (session.user.image == null || session.user.image == undefined) {
        return session;
      } else {
        session.user.id = UserIdFromAvatar(session.user.image) || "undefined";
      }
      return session;
    },
  },
});
// Discord auth only for now to identify quickly for moderation.
