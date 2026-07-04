"use server";
import mysql, { RowDataPacket } from "mysql2/promise";
import { VerifyUserAuth, UnexpectedError } from "@/app/api/records/route";
import { auth, customSession } from "@/auth";
import { NextResponse } from "next/server";
// Proxy route:
//
// GET --> Get Authentication token for proxy. + public ports
// OPTIONAL: DELETE --> Remove proxy account.

// Get session from proxy server.
async function GetAuthentication(userID: string) {
  let connectionParams = {
    host: process.env.PROXYHOST,
    port: 3306,
    user: "proxy",
    password: process.env.PROXYPW,
    database: "jointhisproxy",
  };
  const connection = await mysql.createConnection(connectionParams);
  // Assign OWNER.
  try {
    await connection.query(
      `UPDATE AuthenticationTokens SET OWNER = ${userID} WHERE (OWNER = ${userID} OR ISNULL(OWNER)) ORDER BY OWNER DESC LIMIT 1`,
    );
  } catch (err: any) {
    console.error(err);
    return { error: "Database error." };
  }
  // Get Token, TCP, UDP.
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

    return {
      TOKEN: authKey,
      TCP: tcp,
      UDP: udp,
    };
  } catch (err: any) {
    console.error(err);
    return { error: "Database error." };
  }
}

export async function GET(request: Request) {
  const FullSession = await auth.api.getSession({
    headers: request.headers,
  });
  const session: customSession | undefined = FullSession?.user;
  try {
    // Fetch authentication state.
    const AuthState = VerifyUserAuth(session);
    if (AuthState.state) {
      // User is verified, fetch or create their config.
      const credentials = await GetAuthentication(session?.id || "");
      return NextResponse.json({ credentials }, { status: 200 });
    } else {
      // Return authentication error.
      return NextResponse.json(
        { error: AuthState.error || "Authentication error occurred." },
        { status: 403 },
      );
    }
  } catch (err: any) {
    return UnexpectedError(err, session, "/api/records/", "GET");
  }
}
