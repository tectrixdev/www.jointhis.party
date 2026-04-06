"use server";
import Cloudflare from "cloudflare";
import { NextResponse } from "next/server";
import { auth, customSession } from "@/auth";
import { ValidateDiscordID } from "@/auth";
import { RecordResponse } from "cloudflare/resources/dns/records.mjs";

const client = new Cloudflare({
  apiToken: process.env["CLOUDFLARE_API_TOKEN"],
});
const ZONE_ID = "fc5602181bbb84839aef4907714f435c"; // jointhis.party domain

function IsUserAuthenticated(session: customSession | undefined) {
  // auth validation
  if (!session) {
    return false;
  } else if (!session.verified) {
    return "notValidated";
  } else if (!ValidateDiscordID.test(session.id || "")) {
    // user ID validation, to avoid problems
    return "notValidated";
  } else {
    return true;
  }
}

const blacklist = [
  "*",
  "@",
  "mc",
  "www",
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
        // limitations
        const userRecords = await client.dns.records.list({
          zone_id: ZONE_ID,
          comment: {
            exact: session?.user?.id,
          },
        });
        const UserRecords = userRecords.result;
        const duplicates = await client.dns.records.list({
          zone_id: ZONE_ID,
          name: { exact: `${name}.jointhis.party` },
        });
        function isStolen(result: RecordResponse) {
          return result.comment !== `${session?.user?.id}`;
        }
        const unAuthorizedRecords = duplicates.result.filter(isStolen);
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
        // For logging info. (We don't fetch this from the client, as we don't trust them.)
        const record = await client.dns.records.get(`${id}`, {
          zone_id: ZONE_ID,
        });
        const name = record.name;
        const value = record.content;
        const type = record.type;
        // Actually deleting it.
        const deleteRecord = await client.dns.records.delete(`${id}`, {
          zone_id: ZONE_ID,
        });
        // Logging to the discord server for moderation purposes.
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
        return NextResponse.json(
          { success: true, result: deleteRecord },
          { status: 200 },
        );
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

// List user owned subdomains
export async function GET(request: Request) {
  return getRecords(request);
}

// create subdomain
export async function POST(request: Request) {
  return createRecord(request);
}

// Delete subdomain
export async function DELETE(request: Request) {
  return deleteRecord(request);
}
