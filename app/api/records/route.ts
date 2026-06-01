"use server";
import Cloudflare from "cloudflare";
import { NextResponse } from "next/server";
import { auth, customSession } from "@/auth";
import { ValidateDiscordID } from "@/auth";
import {
  RecordCreateParams,
  RecordListParams,
  RecordResponse,
  RecordResponsesSinglePage,
  RecordResponsesV4PagePaginationArray,
  SRVRecord,
} from "cloudflare/resources/dns/records.mjs";

const client = new Cloudflare({
  apiToken: process.env["CLOUDFLARE_API_TOKEN"],
});
const ZONE_ID = "fc5602181bbb84839aef4907714f435c";
const DOMAIN = "jointhis.party";

// TODO: cleanup, consistent naming, consistent variables. (consistent examples)

// EXAMPLE: myserver.cool.jointhis.party --> myserver.cool
function NameToSubdomain(name: string): string {
  const domainsuffix = `.${DOMAIN}`;
  return name.replace(domainsuffix, "");
}

// EXAMPLE: _minecraft._tcp.myserver.cool --> myserver.cool
function SRVtoSubdomain(SRV: string): string {
  return SRV.split(".").slice(2).join(".");
}

function IsUserAuthenticated(
  session: customSession | undefined,
): "notValidated" | boolean {
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

const blacklist: Array<string> = [
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
        const Records = await client.dns.records.list({
          zone_id: ZONE_ID,
        });
        function isOwned(result: RecordResponse): boolean {
          if (result.comment == session?.user?.id) {
            return true;
          } else {
            return false;
          }
        }
        function isStolen(result: RecordResponse): boolean | undefined {
          // TODO: !prod --> clean up namings etc.
          // NOTE: result.name = subdomain.jointhis.party, name = subdomain (This is due to the cloudflare API)
          // TODO: !prod --> supply global consistency between name and result.name for developer sanity.
          // result = record to check against, this loops through every record, including the records of the user.
          // name, type, ... = pending creation record.

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

          // TODO: same thing as above for B, which is the record we compare against. Make sure to parse SRVtoSubdomain.
          // TODO: Add A/B for the whole function and fix issues with previous implementation
          
          var B: InternalRecord = {
            name: `${result.name}`,
            sub: NameToSubdomain(result.name),
            type: result.type,
          };

          if (result.type == `SRV`) {
            // Removes protocol and service parts of the record.
            // EXAMPLE: _minecraft._tcp.test.dev(.jointhis.party) --> ["_minecraft", "_tcp", "test", "dev"] --> ["test", "dev"] --> "test.dev"
            compare = result as Compare;
            compare.SRVname = result.name
              .replace(".jointhis.party", "")
              .split(".")
              .slice(2)
              .join(".");
          } else {
            compare = result;
            compare.name = result.name.replace(".jointhis.party", "");
          }
          // TODO: Split SRV into service, protocol, subdomain and implement like that.
          if (
            result.name == `${name}.jointhis.party` &&
            result.comment !== `${session?.user?.id}`
          ) {
            // If it matches the record name and the user doesn't own it.
            return true;
          } else if (
            result.type == `SRV` &&
            result.comment !== `${session?.user?.id}` &&
            result.name == `${SRVsubdomain}.jointhis.party`
          ) {
            // If the user makes for example an A record that conflicts with an SRV record of another user.
            return true;
          } else if (
            type == `SRV` &&
            result.comment !== `${session?.user?.id}` &&
            result.name !== `jointhis.party` &&
            // Otherwise it'll deny about everything :0
            `${name}.jointhis.party`.endsWith(result.name)
          ) {
            // If the user makes an SRV record that conflicts with for example an A record of another user.
            return true;
          }
        }
        const UserRecords = Records.result.filter(isOwned);
        const unAuthorizedRecords = Records.result.filter(isStolen);
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
        // For logging info + check if user really owns the record.
        const record = await client.dns.records.get(`${id}`, {
          zone_id: ZONE_ID,
        });
        const name = record.name;
        const value = record.content;
        const type = record.type;
        const comment = record.comment;
        if (comment == session?.user.id) {
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
