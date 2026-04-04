export const baseUrl =
  process.env.NODE_ENV === "development" ||
  !process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? new URL("http://localhost:3000")
    : process.env.VERCEL_TARGET_ENV == "preview"
      ? new URL("https://beta.jointhis.party")
      : new URL(`https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`);
