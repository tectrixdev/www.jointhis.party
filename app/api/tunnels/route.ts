"use server";
import mysql, { RowDataPacket } from "mysql2/promise";
import { VerifyUserAuth, UnexpectedError } from "@/app/api/records/route";
import { auth, customSession } from "@/auth";
import { NextResponse } from "next/server";

// GET: Get user tunnels
// POST: Create tunnel
// PUT: Edit tunnel

// TODO: change code here to reflect new interaction method, dashboard fetches tunnels, if no tunnels, create tunnel button, if a tunnel, editable fields + status.
// When creating a tunnel, check AvailableTunnels table and assign one to the user by creating a tunnel in Tunnels and marking it as taken in the AvailableTunnels table. When editing, edit the tunnel record. Everything should be prepared for multiple tunnels too. For now single tunnel will be standard, but when there is a need for multiple tunnels, it would have to be multiple client instances of rtun per tunnel, until I make my own implementation of it. It isn't a huge issue, but it is a workaround.
// Domain updates should happen right here too. Tunnel update == DNS update.

let connectionParams = {
  host: process.env.PROXYHOST,
  port: 3306,
  user: "proxy",
  password: process.env.PROXYPW,
  database: "jointhisproxy",
};
const connection = await mysql.createConnection(connectionParams);

const PROXYSERVERS = [
  {
    name: "US1",
    IP: "82.38.134.30",
    domain: "proxy.jointhis.party",
    region: "US",
  },
  // US1 is currently the main and only server so it uses proxy.jointhis.party, this will change when there are multiple servers.
];

const FREETUNNELS = 1;

// Body used for tunnel creation.
type CreateTunnel = {
  region: string;
  // See constant above.
  subdomain: string | undefined;
  // Subdomain, if undefined, proxy.jointhis.party or play.jointhis.party is used.
  intUDP: number;
  intTCP: number;
  // Internal ports
  type: "default" | "minecraft" | "https" | "http";
  name: string;
  description: string;
};

// Body the user receives with a GET request.
type FetchTunnel = {
  config: {
    host: string;
    // IP of the proxy server.
    token: string;
    // Rtun token.
    UDP: number;
    TCP: number;
    // External ports.
    intUDP: number;
    intTCP: number;
    // Internal ports.
  };
  meta: {
    type: "default" | "minecraft" | "https" | "http";
    // Default = A record, minecraft = SRV, https + http = for future implementations and / or changes that need to be made for websites, like showing the cloudflare proxy option.
    status: "disabled" | "enabled" | "online";
    name: string;
    // Tunnel name.
    description: string;
    // User description of tunnel, mainly for moderation.
    subdomain: string;
    // Assigned subdomain without .jointhis.party.
  };
};

// Tunnel row as found in the database.
type Tunnel = {
  id?: number;
  // Row number (not important)
  owner: string;
  // User ID of the tunnel owner.
  server: string;
  // Server assigned by the webserver.
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

type ReturnGetTunnels = {
  status: boolean;
  error?: string;
  tunnels?: Tunnel[];
};

async function GetTunnels(userID: string): Promise<ReturnGetTunnels> {
  // Get user Tunnels
  try {
    const [results, fields] = await connection.query<RowDataPacket[]>(
      `SELECT * from Tunnels where owner = ${userID}`,
    );
    return { status: true, tunnels: results as Tunnel[] };
  } catch (err: any) {
    return { status: false, error: err };
  }
}

type ReturnCreateTunnel = {
  status: boolean;
  error?: string;
};

async function CreateTunnel(
  userID: string,
  tunnel: CreateTunnel,
  session: customSession,
): Promise<ReturnCreateTunnel> {
  // Tunnel check etc should not happen here, this function just straight up makes the tunnel without any checks
  // TODO: proper error handling and typing, + subdomain creation?
  try {
    const server = "US1";
    // Due to there only being one server for now.
    const [results, fields] = await connection.query<RowDataPacket[]>(
      `SELECT id, token, TCP, UDP FROM AvailableTunnels WHERE status = 'available' AND server = '${server}'`,
    );
    // TODO: test for no available tunnels
    if (!results.length) {
      return { status: false, error: "No tunnels available." };
      // In the future, loop through region servers if no tunnels available.
    }
    const { id, token, TCP, UDP } = results[0];
    await connection.query(
      `UPDATE AvailableTunnels SET status = 'taken' where id = ${id}`,
    );
    await connection.query(
      `INSERT INTO Tunnels (owner, server, token, subdomain, UDP, TCP, intUDP, intTCP, type, status, name, purpose ) VALUES ("${session?.id}", "${server}", "${token}", "${tunnel.subdomain}", ${UDP}, ${TCP}, ${tunnel.intUDP}, ${tunnel.intTCP}, "${tunnel.type}", "offline", "${tunnel.name}", "${tunnel.description}")`,
    );
  } catch (err: any) {
    return { status: false, error: err.toString() };
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
      // User is verified, pass along their tunnels, granted the user has any.
      // TODO: Test no tunnels case.
      const { status, tunnels } = await GetTunnels(session?.id || "");
      // TODO: status = false handling
      // TODO: move to a function (for example sanitizeOutputTunnels)
      const userTunnels = tunnels?.map((tunnel) => ({
        config: {
          host:
            PROXYSERVERS.find((server) => server.name == tunnel.server)
              ?.domain || "proxy.jointhis.party",
          token: tunnel.token,
          UDP: tunnel.UDP,
          TCP: tunnel.TCP,
          intUDP: tunnel.intUDP || tunnel.UDP,
          intTCP: tunnel.intTCP || tunnel.TCP,
        },
        meta: {
          type: tunnel.type || "default",
          status: tunnel.status || "offline",
          name: tunnel.name,
          description: tunnel.purpose,
          subdomain: tunnel.subdomain || "play",
        },
      }));
      return NextResponse.json({ userTunnels }, { status: 200 });
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
