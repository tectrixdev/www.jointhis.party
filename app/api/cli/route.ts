"use server";
import { auth, ValidateDiscordID } from "@/auth";
import { UserIdFromAvatar } from "@/auth";
import { baseUrl } from "@/lib/metadata";
import mysql, { RowDataPacket } from "mysql2/promise";
import { headers } from "next/headers";

async function GetAuthentication(userID: string) {
  let connectionParams = {
    host: process.env.PROXYHOST,
    port: 3306,
    user: "proxy",
    password: process.env.PROXYPW,
    database: "jointhisproxy",
  };
  const connection = await mysql.createConnection(connectionParams);
  // Assign OWNER
  try {
    await connection.query(
      `UPDATE AuthenticationTokens SET OWNER = ${userID} WHERE (OWNER = ${userID} OR ISNULL(OWNER)) ORDER BY OWNER DESC LIMIT 1`,
    );
  } catch (err: any) {
    console.error(err);
    return Response.json(
      {
        error: "Unable to assign tunnel to user.",
      },
      { status: 500 },
    );
  }
  // Get Token, TCP, UDP
  try {
    type Row = {
      Token: string;
      TCP: number;
      UDP: number;
    };
    const [results, fields] = await connection.query<RowDataPacket[]>(
      `SELECT Token, TCP, UDP from AuthenticationTokens where OWNER = ${userID}`,
    );
    const authKey = results[0].Token;
    const tcp = results[0].TCP;
    const udp = results[0].UDP;

    return Response.json({ TOKEN: authKey, TCP: tcp, UDP: udp });
  } catch (err: any) {
    return Response.json(
      {
        error: "Unable to fetch tunnel info.",
      },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  const body = await request.json();
  const token = body.OTT;
  try {
    // GET authorization
    const data = await auth.api.verifyOneTimeToken({
      body: {
        token: token, // required
      },
    });
    // const result = await fetch(`${baseUrl}/api/records/`, {
    //   headers: {
    //     Authorization: `Bearer ${data.session.token}`,
    //   },
    // });
    const userID = UserIdFromAvatar(data?.user?.image);
    // END
    // Validate DISCORD ID
    if (ValidateDiscordID.test(userID || "")) {
      // Get UDP, TCP, authentication token
      return await GetAuthentication(userID || "");
    } else {
      // FAIL authorization
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
