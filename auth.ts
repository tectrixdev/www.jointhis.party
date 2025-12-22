import NextAuth from "next-auth";
import Discord from "next-auth/providers/discord";

export const { handlers, signIn, signOut, auth } = NextAuth({
	providers: [Discord],
	callbacks: {
		async session({ session }) {
			if (session.user.image == null || session.user.image == undefined)
				return session;
			const url = new URL(session.user.image);
			const userId = url.pathname.split("/")[2];
			session.user.id = userId;

			return session;
		},
	},
});
// Discord auth only for now to identify quickly for moderation.
