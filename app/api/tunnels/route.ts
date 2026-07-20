"use server";
import mysql, { RowDataPacket } from "mysql2/promise";
import { VerifyUserAuth, UnexpectedError } from "@/app/api/records/route";
import { auth, customSession } from "@/auth";
import { NextResponse } from "next/server";

// GET: Get user tunnels
// POST: Create tunnel
// PUT: Edit tunnel

// TODO: change code here to reflect new interaction method, dashboard fetches tunnels, if no tunnels, create tunnel button, if a tunnel, editable fields + status.
// When creating a tunnel, check AvailableTunnels table and assign one to the user by creating a tunnel in Tunnels and marking it as taken in the AvailableTunnels table.
// When editing, edit the tunnel record. Everything should be prepared for multiple tunnels too. For now single tunnel will be standard, but when there is a need for multiple tunnels, it would have to be multiple client instances of rtun per tunnel, until I make my own implementation of it. It isn't a huge issue, but it is a workaround.
// Domain updates should happen right here too.
type Tunnel = {
  id?: number;
  // Row number (not important)
  owner: string;
  // User ID of the tunnel owner.
  token: string;
  // Token for rtun auth.
  subdomain: string;
  // Subdomain, without .jointhis.party.
  UDP: number;
  TCP: number;
  // External ports.
  intUDP: number;
  intTCP: number;
  // Internal ports.
  type: "default" | "minecraft" | "https" | "http";
  // Default = A record, minecraft = SRV, https + http = for future implementations and / or changes that need to be made for websites, like showing the cloudflare proxy option.
  status: "disabled" | "enabled" | "online";
  name: string;
  // Tunnel name.
  purpose: string;
  // User description of tunnel, mainly for moderation.
};
async function GetTunnels(userID: string) {
  let connectionParams = {
    host: process.env.PROXYHOST,
    port: 3306,
    user: "proxy",
    password: process.env.PROXYPW,
    database: "jointhisproxy",
  };
  const connection = await mysql.createConnection(connectionParams);
  // Get user Tunnels
  try {
    const [results, fields] = await connection.query<RowDataPacket[]>(
      `SELECT * from Tunnels where owner = ${userID}`,
    );
    return results;
  } catch (err: any) {
    console.error(err);
    return { error: "Database error." };
  }
}

async function CreateTunnel(userID: string, tunnel: Tunnel) {
  // Tunnel check etc should not happen here, this function just straight up makes the tunnel without any checks
  // First: Check for available tunnels / authentication tokens
  // Second: Create tunnel.
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
      // User is verified, pass along their tunnels, granted the user has any.
      // TODO: Test no tunnels case.
      const tunnels = await GetTunnels(session?.id || "");
      return NextResponse.json({ tunnels }, { status: 200 });
    } else {
      // Return authentication error.
      return NextResponse.json(
        { error: AuthState.error || "Authentication error occurred." },
        { status: 403 },
      );
    }
  } catch (err: any) {
    return UnexpectedError(err, session, "/api/tunnels/", "GET");
  }
}
