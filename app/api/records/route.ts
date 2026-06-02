"use server";
import Cloudflare from "cloudflare";
import { NextResponse } from "next/server";
import { auth, customSession } from "@/auth";
import { ValidateDiscordID } from "@/auth";
import { RecordResponse } from "cloudflare/resources/dns/records.mjs";

const client = new Cloudflare({
  apiToken: process.env["CLOUDFLARE_API_TOKEN"],
});
const ZONE_ID = "fc5602181bbb84839aef4907714f435c";
const DOMAIN = "jointhis.party";

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

function isStolen(result: RecordResponse, body: any): boolean {
  const { name, type, value, port } = body;
  // A --> pending record
  // B --> record to check against
  interface InternalRecord {
    name: string;
    sub: string;
    type: string;
  }

  var A: InternalRecord;
  var B: InternalRecord;

  if (type == `SRV`) {
    A = {
      name: `${name}.${DOMAIN}`,
      sub: SRVtoSubdomain(name),
      type: type,
    };
  } else {
    A = {
      name: `${name}.${DOMAIN}`,
      sub: `${name}`,
      type: type,
    };
  }

  // With fetched results, cloudflare includes the domain in the "name" parameter. When creating, it only requires the subdomain. Therefore these conversions are necessary.
  if (result.type == `SRV`) {
    B = {
      name: `${result.name}`,
      sub: SRVtoSubdomain(NameToSubdomain(result.name)),
      type: result.type,
    };
  } else {
    B = {
      name: `${result.name}`,
      sub: NameToSubdomain(result.name),
      type: type,
    };
  }

  // Automatically prevents SRV and A record conflicts due to above conversions.
  if (A.sub == B.sub) {
    return true;
  } else {
    return false;
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
    console.error(err);
    return NextResponse.json(
      { error: err?.errors[0].message || "Unknown error" },
      { status: 500 },
    );
  }
}

async function LogDeletion(record: RecordResponse, session: any) {
  const { name, content, type } = record;
  if (process.env.LOGS_WEBHOOK) {
    await fetch(process.env.LOGS_WEBHOOK, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        content: "<@&1448781724803661927>",
        tts: false,
        embeds: [
          {
            id: 652627557,
            title: "New subdomain deleted!",
            description: `NAME: **${name}**\nURL: https://${name}\nOWNER: <@${session?.user?.id}>`,
            color: 2326507,
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
// TODO: value --> content for consistency.
async function LogCreation(body: any, session: any) {
  const { name, type, value } = body;
  if (process.env.LOGS_WEBHOOK) {
    await fetch(process.env.LOGS_WEBHOOK, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        content: "<@&1448781724803661927>",
        tts: false,
        embeds: [
          {
            id: 652627557,
            title: "New subdomain created!",
            description: `NAME: **${name}.jointhis.party**\nURL: https://${name}.jointhis.party\nOWNER: <@${session?.user?.id}>`,
            color: 2326507,
            fields: [
              {
                id: 986834541,
                name: "IP",
                value: `${value}`,
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

// TODO: Simplify into one function, just change message depending on deletion or creation.

export async function createRecord(request: Request) {
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
        const { name, type, value, port } = body;
        const Records = await client.dns.records.list({
          zone_id: ZONE_ID,
        });
        // CONTEXT: Records --> all DNS records
        // Filter all records down to only records which belong to the user.
        const UserRecords = Records.result.filter((record) =>
          isOwned(record, session),
        );
        // Test for possible matches with other users records.
        const unAuthorizedRecords = Records.result.filter((record) =>
          isStolen(record, body),
        );
        // If no matching records are found which don't belong to the user:
        // CONTEXT: If unAuthorizedRecords is not an array, nor has any length, it means no matching records have been found.
        if (
          !Array.isArray(unAuthorizedRecords) ||
          !unAuthorizedRecords.length
        ) {
          if (UserRecords.length > 5) {
            return NextResponse.json(
              {
                error:
                  "Maximum amount of records reached. If you need more, please create a support ticket.",
              },
              { status: 403 },
            );
          }
          if (blacklist.includes(name)) {
            return NextResponse.json(
              {
                error:
                  "Subdomain name not allowed! If this is a mistake, please create a support ticket.",
              },
              { status: 403 },
            );
          }
          // Creation.
          const payload: any = {
            zone_id: ZONE_ID,
            name: `${name}`,
            type: `${type}`,
            ttl: 3600,
            content: `${value}`,
            comment: session?.user?.id ?? undefined,
          };
          // comment == undefined should NOT happen!
          if (type === "SRV") {
            payload.data = {
              name: `${name}`,
              priority: 0,
              weight: 0,
              port: Number(port || 0),
              target: `${value}`,
            };
            delete payload.content;
          }
          // Actually create the record here.
          const recordResponse = await client.dns.records.create(payload);
          // Logging to the discord server for moderation purposes.
          LogCreation(body, session);
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
          LogDeletion(record, session);
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
