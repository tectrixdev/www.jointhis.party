"use server";
import { auth, ValidateDiscordID } from "@/auth";
import { UserIdFromAvatar } from "@/auth";
import { baseUrl } from "@/lib/metadata";
import mysql, { RowDataPacket } from "mysql2/promise";
import { createRecord } from "../records/route";

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

// Expected API body.
interface body {
  OTT: string;
  SUBDOMAIN?: string;
  TYPE?: "MC" | "CUSTOM" | "WEB";
}

export async function POST(request: Request) {
  const body: body = await request.json();
  const token = body.OTT;
  const sub = body.SUBDOMAIN;
  const type = body.TYPE;
  try {
    // OTT --> SESSION.
    const data = await auth.api.verifyOneTimeToken({
      body: {
        token: token,
      },
    });
    // Validate DISCORD ID.
    const userID = UserIdFromAvatar(data?.user?.image);
    if (ValidateDiscordID.test(userID || "")) {
      var DNS;
      const Authentication = await GetAuthentication(userID || "");
      if (!Authentication.error) {
        const { TOKEN, TCP, UDP } = Authentication;
        // Make DNS records.
        if (sub && type) {
          if (type == "CUSTOM" || type == "WEB") {
            const payload = {
              name: sub,
              type: "CNAME",
              value: "proxy.jointhis.party",
            };
            const request = new Request(`${baseUrl.origin}/api/records/`, {
              method: "POST",
              headers: {
                Authorization: `Bearer ${data.session.token}`,
                "Content-Type": `application/json`,
              },
              body: JSON.stringify(payload),
            });
            const result = await createRecord(request);
            const body = await result.json();
            if (
              result.ok ||
              body?.error === "An identical record already exists."
            ) {
              DNS = "CREATED";
            } else {
              DNS = body?.error;
            }
          } else if (type == "MC") {
            // Create SRV record.
            const payload = {
              name: `_minecraft._tcp.${sub}`,
              type: "SRV",
              value: `proxy.jointhis.party`,
              port: TCP,
            };
            const request = new Request(`${baseUrl.origin}/api/records/`, {
              method: "POST",
              headers: {
                Authorization: `Bearer ${data.session.token}`,
                "Content-Type": `application/json`,
              },
              body: JSON.stringify(payload),
            });
            const result = await createRecord(request);
            const body = await result.json();
            if (
              result.ok ||
              body?.error === "An identical record already exists."
            ) {
              DNS = "CREATED";
            } else {
              DNS = body?.error;
            }
          } else {
            DNS = "Unrecognized type.";
          }
        } else {
          DNS = "No record requested.";
        }
        return Response.json({ TOKEN: TOKEN, TCP: TCP, UDP: UDP, DNS: DNS });
      } else {
        // Failed to get session from proxy server.
        return Response.json(
          {
            error: Authentication.error,
          },
          { status: 500 },
        );
      }
    } else {
      // FAIL authorization (for preventing injection and invalid authentication sessions.)
      return Response.json(
        {
          error: "Failed to verify Discord ID",
        },
        { status: 401 },
      );
    }
  } catch (err: any) {
    // Any unexpected error.
    console.error(err);
    return Response.json(
      {
        error: err?.body?.message,
        DNSerror: DNS,
      },
      { status: err?.statusCode },
    );
  }
}
