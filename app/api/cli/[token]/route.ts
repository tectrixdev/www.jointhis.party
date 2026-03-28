"use server";
import type { NextRequest } from "next/server";
import { auth, ValidateDiscordID } from "@/auth";
import { UserIdFromAvatar } from "@/auth";
import mysql from "mysql2/promise";

async function GetConfig(userID: string) {
  let connectionParams = {
    host: process.env.PROXYHOST,
    port: 3306,
    user: "proxy",
    password: process.env.PROXYPW,
    database: "jointhisproxy",
  };
  const connection = await mysql.createConnection(connectionParams);
}

export async function GET(
  _req: NextRequest,
  ctx: RouteContext<"/api/cli/[token]">,
) {
  const { token } = await ctx.params;
  try {
    const data = await auth.api.verifyOneTimeToken({
      body: {
        token: token, // required
      },
    });
    const userID = UserIdFromAvatar(data?.user?.image);
    if (ValidateDiscordID.test(userID || "")) {
      const configFile = GetConfig(userID || "");
      return Response.json({ config: configFile });
    } else {
      return Response.json(
        {
          error: "Failed to verify Discord ID",
        },
        { status: 401 },
      );
    }
  } catch (err: any) {
    return Response.json(
      {
        error: err?.body?.message,
      },
      { status: err?.statusCode },
    );
  }
}
