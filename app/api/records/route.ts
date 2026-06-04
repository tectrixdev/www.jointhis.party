"use server";
import Cloudflare from "cloudflare";
import { NextResponse } from "next/server";
import { auth, customSession } from "@/auth";
import { ValidateDiscordID } from "@/auth";
import {
  RecordCreateParams,
  RecordResponse,
} from "cloudflare/resources/dns/records.mjs";

// Initialize Cloudflare API instance.
const client = new Cloudflare({
  apiToken: process.env["CLOUDFLARE_API_TOKEN"],
});

// Cloudflare zone == internal code for domain.
const ZONE_ID = "fc5602181bbb84839aef4907714f435c";

// Domain for subdomain conversions etc.
const DOMAIN = "jointhis.party";

// Moderator role ID to ping when needed
const MODERATORS = "1448781724803661927";

// TODO: cleanup, consistent naming, consistent variables. (consistent examples)

// EXAMPLE: myserver.cool.jointhis.party --> myserver.cool
function NameToSubdomain(name: string): string {
  const suffix = `.${DOMAIN}`;
  return name.replace(suffix, "");
}

// EXAMPLE: _minecraft._tcp.myserver.cool --> myserver.cool
function SRVtoSubdomain(SRV: string): string {
  return SRV.split(".").slice(2).join(".");
}

function IsUserAuthenticated(
  session: customSession | undefined,
): "notValidated" | boolean {
  if (!session) {
    // No session --> Not authenticated.
    return false;
  } else if (!session.verified) {
    // Email not verified.
    return "notValidated";
  } else if (!ValidateDiscordID.test(session.id || "")) {
    // Test the userID with a regular expression, as the parsing in auth.ts may fail, which causes a lot of issues.
    return "notValidated";
  } else {
    // User passes all checks, hence the user is successfully authenticated.
    return true;
  }
}

// Reserved subdomains for internal use or too common names.
// NOTE: * --> Wildcard on root, @ --> root

const blacklist: Array<string> = [
  "*",
  "@",
  "mc",
  "www",
  "ww2",
  "ww3",
  "blog",
  "contact",
  "docs",
  "official",
  "minecraft",
  "join",
  "jointhis.party",
  "tool",
  "discord",
  "hub",
  "main",
  "site",
  "tectrix",
  "jointhis",
  "party",
  "beta",
  "play",
  "proxy",
  "proxy1",
  "proxy2",
  "proxy3",
  "proxy4",
  "proxyserver",
  "vps",
  "vps1",
  "vps2",
  "vps3",
  "vps4",
];

// TODO: Global function here for checking wether a subdomain is allowed.

function IsSubdomainAllowed(subdomain: string): boolean {
  // Check if above list includes the subdomain, if yes, mark as disallowed.
  if (blacklist.includes(subdomain)) {
    return false;
  }
  // Allow alphanumeric characters only to prevent @ or * in the subdomain name, which could lead to problems.
  if (subdomain.match("[a-zA-Z0-9]+")) {
    return true;
  } else {
    return false;
  }
}

function isOwned(result: RecordResponse, session: any): boolean {
  if (result.comment == session?.user?.id) {
    return true;
  } else {
    return false;
  }
}

function isStolen(result: RecordResponse, body: any, session: any): boolean {
  const { name, type, comment } = body;
  // A --> pending record
  // B --> record to check against
  interface InternalRecord {
    name: string;
    sub: string;
    type: string;
    comment: string;
  }

  var A: InternalRecord;
  var B: InternalRecord;

  if (type == `SRV`) {
    A = {
      name: `${name}.${DOMAIN}`,
      sub: SRVtoSubdomain(name),
      type: type,
      comment: comment,
    };
  } else {
    A = {
      name: `${name}.${DOMAIN}`,
      sub: `${name}`,
      type: type,
      comment: comment,
    };
  }

  // With fetched results, cloudflare includes the domain in the "name" parameter. When creating, it only requires the subdomain. Therefore these conversions are necessary.
  if (result.type == `SRV`) {
    B = {
      name: `${result.name}`,
      sub: SRVtoSubdomain(NameToSubdomain(result.name)),
      type: result.type,
      comment: comment,
    };
  } else {
    B = {
      name: `${result.name}`,
      sub: NameToSubdomain(result.name),
      type: type,
      comment: comment,
    };
  }
  // Automatically prevents SRV and A record conflicts due to above conversions.
  // Testcase: comments
  if (A.sub == B.sub && B.comment !== session?.user?.comment) {
    return true;
  } else {
    return false;
  }
}

async function Log(
  message: string,
  identifier: string | undefined,
  error: boolean,
) {
  if (process.env.LOGS_WEBHOOK) {
    await fetch(process.env.LOGS_WEBHOOK, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        content: error ? `<@&${MODERATORS}>` : ``,
        tts: false,
        embeds: [
          {
            id: 652627557,
            title: error ? "Error" : "Successful",
            description: message,
            color: error ? 15548997 : 326507,
            fields: [
              {
                id: 986834541,
                name: "User",
                value: `<@&${identifier}>`,
              },
            ],
          },
        ],
        components: [],
        actions: {},
        flags: 0,
      }),
    });
  }
}

async function LogRecord(
  record: RecordResponse,
  session: any,
  deletion: boolean,
) {
  const { name, content, type } = record;
  if (process.env.LOGS_WEBHOOK) {
    await fetch(process.env.LOGS_WEBHOOK, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        content: `<@&${MODERATORS}>`,
        tts: false,
        embeds: [
          {
            id: 652627557,
            title: deletion ? "Subdomain deleted" : "New subdomain registered",
            description: `NAME: **${name}**\nURL: https://${name}\nOWNER: <@${session?.user?.id}>`,
            color: deletion ? 15548997 : 326507,
            fields: [
              {
                id: 986834541,
                name: "IP",
                value: `${content}`,
              },
              {
                id: 356214976,
                name: "Record Type",
                value: `${type}`,
              },
            ],
          },
        ],
        components: [],
        actions: {},
        flags: 0,
      }),
    });
  }
}

export async function getRecords(request: Request) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });
    switch (IsUserAuthenticated(session?.user)) {
      case false: {
        return NextResponse.json({ error: "Please log in." }, { status: 401 });
      }
      case "notValidated": {
        Log(
          "User failed regular expression or has not verified their email.",
          session?.user?.id,
          true,
        );
        return NextResponse.json(
          {
            error:
              "Discord user ID or e-mail could not be validated, please make a support ticket.",
          },
          { status: 500 },
        );
      }
      case true: {
        // Get records associated with user id, possibly dangerous if it's empty. Should be fine with the validation of the userID
        const userRecords = await client.dns.records.list({
          zone_id: ZONE_ID,
          comment: {
            exact: session?.user?.id,
          },
        });
        const UserRecords = userRecords.result;
        return NextResponse.json({ UserRecords }, { status: 200 });
      }
    }
  } catch (err: any) {
    const session = await auth.api.getSession({
      headers: request.headers,
    });
    Log("Unexpected error while fetching records.", session?.user?.id, true);
    console.error(err);
    return NextResponse.json(
      { error: err?.errors[0].message || "Unknown error" },
      { status: 500 },
    );
  }
}

export async function createRecord(request: Request) {
  try {
    // Get authentication session.
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    // Authentication.
    switch (IsUserAuthenticated(session?.user)) {
      case false: {
        return NextResponse.json({ error: "Please log in." }, { status: 401 });
      }
      case "notValidated": {
        Log(
          "User failed regular expression or has not verified their email.",
          session?.user?.id,
          true,
        );
        return NextResponse.json(
          {
            error:
              "Discord user ID or e-mail could not be validated, please make a support ticket.",
          },
          { status: 500 },
        );
      }
      // Authentication success.
      case true: {
        const body = await request.json();
        const { name, content, port } = body;
        // These are the only possible options, see ToolInput.tsx
        const type = body.type as "A" | "AAAA" | "CNAME" | "SRV";
        const Records = await client.dns.records.list({
          zone_id: ZONE_ID,
        });
        if (!IsSubdomainAllowed(name)) {
          Log(
            "User tried registering a blacklisted subdomain",
            session?.user?.id,
            true,
          );
          return NextResponse.json(
            {
              error:
                "Subdomain name not allowed! If this is a mistake, please create a support ticket.",
            },
            { status: 403 },
          );
        }
        // CONTEXT: Records --> all DNS records
        // Filter all records down to only records which belong to the user.
        const UserRecords = Records.result.filter((record) =>
          isOwned(record, session),
        );
        // Test for possible matches with other users records.
        const unAuthorizedRecords = Records.result.filter((record) =>
          isStolen(record, body, session),
        );
        // If no matching records are found which don't belong to the user:
        // CONTEXT: If unAuthorizedRecords is not an array, nor has any length, it means no matching records have been found.
        if (
          !Array.isArray(unAuthorizedRecords) ||
          !unAuthorizedRecords.length
        ) {
          if (UserRecords.length > 5) {
            Log(
              "User reached maximum amount of allowed records.",
              session?.user?.id,
              true,
            );

            return NextResponse.json(
              {
                error:
                  "Maximum amount of records reached. If you need more, please create a support ticket.",
              },
              { status: 403 },
            );
          }

          var payload: RecordCreateParams;
          if (type === "SRV") {
            // SRV record payload format.
            // TTL --> 3600 because most subdomains don't last long or are expected to change owners quickly.
            // comment --> This is (for now) used to store ownership information, which is just the discord user ID.
            payload = {
              zone_id: ZONE_ID,
              name: `${name}`,
              type: `${type}`,
              ttl: 3600,
              comment: session?.user?.id ?? undefined,
              data: {
                priority: 0,
                weight: 0,
                port: Number(port || 0),
                target: `${content}`,
              },
            };
          } else {
            // Payload for ordinary records such as TXT, A, AAAA
            payload = {
              zone_id: ZONE_ID,
              name: `${name}`,
              type: `${type}`,
              ttl: 3600,
              content: `${content}`,
              comment: session?.user?.id ?? undefined,
            };
          }
          // comment == undefined should NOT happen!
          const recordResponse = await client.dns.records.create(payload);
          // Logging to the discord server for moderation purposes.
          LogRecord(body, session, false);
          return NextResponse.json(
            { success: true, record: recordResponse },
            { status: 200 },
          );
        } else {
          return NextResponse.json(
            {
              error:
                "Identical record already exists and is in use by another user.",
            },
            { status: 403 },
          );
        }
      }
    }
  } catch (err: any) {
    console.error(err);
    return NextResponse.json(
      { error: err?.errors[0].message || "Unknown error" },
      { status: 500 },
    );
  }
}

export async function deleteRecord(request: Request) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });
    switch (IsUserAuthenticated(session?.user)) {
      case false: {
        return NextResponse.json({ error: "Please log in." }, { status: 401 });
      }
      case "notValidated": {
        return NextResponse.json(
          {
            error:
              "Discord user ID or e-mail could not be validated, please make a support ticket.",
          },
          { status: 500 },
        );
      }
      case true: {
        const body = await request.json();
        const { id } = body;
        if (!id) {
          return NextResponse.json(
            { error: "Missing record id" },
            { status: 400 },
          );
        }
        // For logging info + check if user really owns the record.
        const record = await client.dns.records.get(`${id}`, {
          zone_id: ZONE_ID,
        });
        // Check if the user owns the pending record, to make sure the client isn't lying.
        if (record.comment == session?.user.id) {
          // Actually deleting it.
          const deleteRecord = await client.dns.records.delete(`${id}`, {
            zone_id: ZONE_ID,
          });
          // Logging to the discord server for moderation purposes.
          LogRecord(record, session, true);
          return NextResponse.json(
            { success: true, result: deleteRecord },
            { status: 200 },
          );
        } else {
          return NextResponse.json(
            { error: "Record not owned by user." },
            { status: 403 },
          );
        }
      }
    }
  } catch (err: any) {
    console.error(err);
    return NextResponse.json(
      { error: err?.message || "Unknown error" },
      { status: 500 },
    );
  }
}

// List user owned subdomains.
export async function GET(request: Request) {
  return getRecords(request);
}

// Create subdomain.
export async function POST(request: Request) {
  return createRecord(request);
}

// Delete subdomain.
export async function DELETE(request: Request) {
  return deleteRecord(request);
}
