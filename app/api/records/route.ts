"use server";
import Cloudflare from "cloudflare";
import { NextResponse } from "next/server";
import { auth, customSession } from "@/auth";
import { ValidateDiscordID } from "@/auth";
import {
  RecordCreateParams,
  RecordResponse,
  RecordResponsesV4PagePaginationArray,
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

// Logging:
interface Field {
  name: string;
  value: string;
  inline?: boolean;
}
async function Log(
  message: string,
  identifier: string | undefined,
  error: boolean,
  info?: Array<Field>,
) {
  error ? console.error(message, info) : console.log(message, info);
  if (process.env.LOGS_WEBHOOK) {
    const userField: Array<Field> = [
      {
        name: "User",
        value: `<@${identifier}>`,
      },
    ];
    const Fields: Array<Field> = info ? userField.concat(info) : userField;
    await fetch(process.env.LOGS_WEBHOOK, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        content: error ? `<@&${MODERATORS}>` : ``,
        embeds: [
          {
            title: error ? ":warning: Error" : ":white_check_mark: Successful",
            description: message,
            color: error ? 15548997 : 326507,
            fields: Fields.map((field) =>
              field.inline
                ? {
                    name: field.name,
                    value: field.value,
                    inline: field.inline,
                  }
                : { name: field.name, value: field.value },
            ),
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
  session: customSession | undefined,
  deletion: boolean,
) {
  const { content, type } = record;
  var name;
  deletion ? (name = NameToSubdomain(record.name)) : (name = record.name);
  console.log(
    deletion
      ? `Record of type ${type} with name ${name} deleted by ${session?.id}.`
      : `Record of type ${type} with name ${name} created by ${session?.id}.`,
  );
  if (process.env.LOGS_WEBHOOK) {
    await fetch(process.env.LOGS_WEBHOOK, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        content: `<@&${MODERATORS}>`,
        embeds: [
          {
            title: deletion ? "Subdomain deleted" : "New subdomain registered",
            description: `NAME: **${name}**\nURL: https://${name}.${DOMAIN}\nOWNER: <@${session?.id}>`,
            color: deletion ? 15548997 : 326507,
            fields: [
              {
                name: "IP",
                value: `${content}`,
              },
              {
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

// EXAMPLE: myserver.cool.jointhis.party --> myserver.cool
function NameToSubdomain(name: string): string {
  const suffix = `.${DOMAIN}`;
  return name.replace(suffix, "");
}

// EXAMPLE: _minecraft._tcp.myserver.cool --> myserver.cool
function SRVToSubdomain(SRV: string): string {
  return SRV.split(".").slice(2).join(".");
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

function UnexpectedError(
  err: any,
  session: customSession | undefined,
  route: string,
  method: "GET" | "DELETE" | "POST",
): NextResponse {
  Log(`Unexpected error occurred.`, session?.id, true, [
    { name: "Error", value: err.toString(), inline: true },
    { name: "Route", value: route, inline: true },
    { name: "Method", value: method, inline: true },
  ]);
  return NextResponse.json(
    { error: err?.errors[0].message || "Unknown error" },
    { status: 500 },
  );
}

interface AuthState {
  state: boolean;
  error?: string;
}
function VerifyUserAuth(session: customSession | undefined): AuthState {
  // Try if session is valid.
  if (
    session &&
    session.verified &&
    ValidateDiscordID.test(session?.id || "")
  ) {
    return { state: true };
  }

  // Session is most likely not valid, state reasons for each fail.
  if (!session) {
    return { state: false, error: "Please log in." };
  }
  // If the user ID in the session does not match the proper format.
  if (!ValidateDiscordID.test(session?.id || "")) {
    Log("User failed regular expression.", session?.id, true);
    return {
      state: false,
      error: "Could not verify your discord ID, please contact support.",
    };
  }
  // If email of the user is not verified, this is for bot and alt protection.
  if (!session.verified) {
    Log("User has not verified their email.", session?.id, true);
    return { state: false, error: "Your e-mail on discord is not verified." };
  }
  // Panic statement.
  return { state: false, error: "An unknown error occurred." };
}

interface SubdomainAvailability {
  status: boolean;
  error?: string;
}

function SubdomainAvailability(
  Records: RecordResponsesV4PagePaginationArray,
  session: customSession | undefined,
  body: any,
): SubdomainAvailability {
  const subdomain = body.name;
  const MaximumRecords = 5;
  // Check if above list includes the subdomain, if yes, mark as disallowed.
  if (blacklist.includes(subdomain)) {
    Log(`User tried to register a blacklisted subdomain.`, session?.id, true, [
      { name: "Subdomain", value: subdomain },
    ]);
    return { status: false, error: "This subdomain is blacklisted." };
  }
  // Allow alphanumeric characters only to prevent @ or * in the subdomain name, which could lead to problems.
  const FullMatch = subdomain.match("[a-zA-Z0-9]+")[0] === subdomain;
  if (!FullMatch) {
    Log(
      `User tried registering non-alphanumeric subdomain.`,
      session?.id,
      true,
      [{ name: "Subdomain", value: subdomain }],
    );
    return {
      status: false,
      error: "Subdomains may only include alphanumeric characters.",
    };
  }
  // CONTEXT: Records --> all DNS records
  // Filter all records down to only records which belong to the user.
  const UserRecords = Records.result.filter((record) =>
    isOwned(record, session),
  );
  // Test for possible matches with other users records.
  const unAuthorizedRecords = Records.result.filter((record) =>
    isInUse(record, body, session),
  );

  // If no matching records are found which don't belong to the user:
  // CONTEXT: If unAuthorizedRecords is not an array, nor has any length, it means no matching records have been found. --> If it is an array, AND its length is bigger than 0, there are matching records found.
  if (Array.isArray(unAuthorizedRecords) && unAuthorizedRecords.length > 0) {
    Log(
      `User tried registering a subdomain already in use.`,
      session?.id,
      true,
      [
        { name: "Subdomain", value: subdomain, inline: true },
        {
          name: "Conflicting user",
          value: `<@${unAuthorizedRecords[0].comment}>`,
          inline: true,
        },
      ],
    );
    return {
      status: false,
      error: "This subdomain is already in use.",
    };
  }
  // + 1, as UserRecords is before creation, and we should compare the situation as if we would've created a new record.
  if (UserRecords.length + 1 > MaximumRecords) {
    Log("User reached maximum amount of allowed records.", session?.id, true);
    return {
      status: false,
      error: "You have reached the maximum amount of subdomains.",
    };
  }
  if (
    !blacklist.includes(subdomain) &&
    FullMatch &&
    unAuthorizedRecords.length == 0 &&
    UserRecords.length < MaximumRecords
  ) {
    return { status: true };
  } else {
    Log(`Subdomain validation has failed unexpectedly.`, session?.id, true, [
      { name: "Subdomain", value: subdomain },
      { name: "unAuthorizedRecords", value: unAuthorizedRecords },
      { name: "The users records", value: UserRecords },
    ]);
    return { status: false, error: "An unexpected error occurred." };
  }
}

function isOwned(
  result: RecordResponse,
  session: customSession | undefined,
): boolean {
  if (result.comment == session?.id) {
    return true;
  } else {
    return false;
  }
}
function isInUse(
  result: RecordResponse,
  body: any,
  session: customSession | undefined,
): boolean {
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
      sub: SRVToSubdomain(name),
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
      sub: SRVToSubdomain(NameToSubdomain(result.name)),
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
  if (A.sub == B.sub) {
    return true;
  } else {
    return false;
  }
}
export async function getRecords(request: Request) {
  const FullSession = await auth.api.getSession({
    headers: request.headers,
  });
  const session: customSession | undefined = FullSession?.user;
  try {
    // Fetch authentication state.
    const AuthState = VerifyUserAuth(session);
    if (AuthState.state) {
      // Get records owned by user which we can find by matching their discord user ID in the comment of the DNS record.
      const userRecords = await client.dns.records.list({
        zone_id: ZONE_ID,
        comment: {
          exact: session?.id,
        },
      });
      const UserRecords = userRecords.result;
      return NextResponse.json({ UserRecords }, { status: 200 });
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

export async function createRecord(request: Request) {
  const FullSession = await auth.api.getSession({
    headers: request.headers,
  });
  const session: customSession | undefined = FullSession?.user;
  try {
    // Fetch authentication state.
    const AuthState = VerifyUserAuth(session);
    if (AuthState.state) {
      const body = await request.json();
      const { name, content, port } = body;
      // These are the only possible options, see ToolInput.tsx
      const type = body.type as "A" | "AAAA" | "CNAME" | "SRV";
      const Records = await client.dns.records.list({
        zone_id: ZONE_ID,
      });

      const Availability = SubdomainAvailability(Records, session, body);
      if (Availability.status) {
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
            comment: session?.id ?? undefined,
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
            comment: session?.id ?? undefined,
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
        // Error while validating.
        return NextResponse.json(
          {
            error:
              Availability.error ||
              "An error occurred while validating your subdomain.",
          },
          { status: 403 },
        );
      }
    } else {
      // Return authentication error.
      return NextResponse.json(
        { error: AuthState.error || "Authentication error occurred." },
        { status: 403 },
      );
    }
  } catch (err: any) {
    return UnexpectedError(err, session, "/api/records/", "POST");
  }
}

export async function deleteRecord(request: Request) {
  const FullSession = await auth.api.getSession({
    headers: request.headers,
  });
  const session: customSession | undefined = FullSession?.user;
  try {
    // Fetch authentication state.
    const AuthState = VerifyUserAuth(session);
    if (AuthState.state) {
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
      if (record.comment == session?.id) {
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
    } else {
      // Return authentication error.
      return NextResponse.json(
        { error: AuthState.error || "Authentication error occurred." },
        { status: 403 },
      );
    }
  } catch (err: any) {
    return UnexpectedError(err, session, "/api/records/", "DELETE");
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
