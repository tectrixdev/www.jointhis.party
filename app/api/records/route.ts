"use server";
import Cloudflare from "cloudflare";
import { NextResponse } from "next/server";
import { auth } from "@/auth";

const client = new Cloudflare({
	apiToken: process.env["CLOUDFLARE_API_TOKEN"],
});
const ZONE_ID = "fc5602181bbb84839aef4907714f435c"; // jointhis.party domain

// List user owned subdomains
export async function GET(request: Request) {
	try {
		const session = await auth();
		if (!session) {
			return NextResponse.json({ error: "Please log in." }, { status: 401 });
		}
		const userRecords = await client.dns.records.list({
			zone_id: ZONE_ID,
			comment: {
				contains: session.user?.id,
			},
		});
		const UserRecords = userRecords.result;
		return NextResponse.json({ UserRecords }, { status: 200 });
	} catch (err: any) {
		console.error(err);
		return NextResponse.json(
			{ error: err?.errors[0].message || "Unknown error" },
			{ status: 500 },
		);
	}
}

// create subdomain
export async function POST(request: Request) {
	try {
		const body = await request.json();
		const { name, type, value, port } = body;
		const session = await auth();
		if (!session) {
			return NextResponse.json({ error: "Please log in." }, { status: 401 });
		}
		// limitations
		const userRecords = await client.dns.records.list({
			zone_id: ZONE_ID,
			comment: {
				contains: session.user?.id,
			},
		});
		const UserRecords = userRecords.result;
		if (UserRecords.length >= 5) {
			return NextResponse.json(
				{
					error:
						"Maximum amount of records reached. If you need more, please create a support ticket.",
				},
				{ status: 403 },
			);
		}
		if (
			[
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
			].includes(name)
		) {
			return NextResponse.json(
				{
					error:
						"Subdomain name not allowed! If this is a mistake, please create a support ticket.",
				},
				{ status: 403 },
			);
		}
		// creation.
		const payload: any = {
			zone_id: ZONE_ID,
			name: `${name}`,
			type: `${type}`,
			ttl: 3600,
			content: `${value}`,
			comment: session.user?.id ?? undefined,
		};

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

		const recordResponse = await client.dns.records.create(payload);
		// Logging to the discord server for moderation purposes
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
							description: `NAME: **${name}**\nURL: https://${name}.jointhis.party\nOWNER: <@${session.user?.id}>`,
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
	} catch (err: any) {
		console.error(err);
		return NextResponse.json(
			{ error: err?.errors[0].message || "Unknown error" },
			{ status: 500 },
		);
	}
}

// edit
export async function PUT(request: Request) {
	try {
		const session = await auth();
		if (!session) {
			return NextResponse.json({ error: "Please log in." }, { status: 401 });
		}

		const body = await request.json();
		const { id, value, port } = body;
		if (!id) {
			return NextResponse.json({ error: "Missing record id" }, { status: 400 });
		}
		const record = await client.dns.records.get(`${id}`, {
			zone_id: ZONE_ID,
		});
		const name = record.name;
		const type = record.type;
		const payload: any = {
			name: name ? `${name}` : undefined,
			type: type ? `${type}` : undefined,
			ttl: 3600,
			comment: session.user?.id ?? undefined,
		};

		if (type === "SRV") {
			payload.data = {
				name: `_minecraft._tcp.${name}`,
				priority: 0,
				weight: 0,
				port: Number(port || 0),
				target: `${value}`,
			};
		} else if (value !== undefined) {
			payload.content = `${value}`;
		}

		Object.keys(payload).forEach(
			(k) => payload[k] === undefined && delete payload[k],
		);

		payload.zone_id = ZONE_ID;

		const recordResponse = await client.dns.records.update(id, payload);
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
							title: "New subdomain edited!",
							description: `NAME: **${name}**\nURL: https://${name}\nOWNER: <@${session.user?.id}>`,
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
	} catch (err: any) {
		console.error(err);
		return NextResponse.json(
			{ error: err?.message || "Unknown error" },
			{ status: 500 },
		);
	}
}

// Delete subdomain
export async function DELETE(request: Request) {
	try {
		const session = await auth();
		if (!session) {
			return NextResponse.json({ error: "Please log in." }, { status: 401 });
		}

		const body = await request.json();
		const { id } = body;
		if (!id) {
			return NextResponse.json({ error: "Missing record id" }, { status: 400 });
		}
		const record = await client.dns.records.get(`${id}`, {
			zone_id: ZONE_ID,
		});
		const name = record.name;
		const value = record.content;
		const type = record.type;
		const deleteRecord = await client.dns.records.delete(`${id}`, {
			zone_id: ZONE_ID,
		});
		// Logging to the discord server for moderation purposes
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
							description: `NAME: **${name}**\nURL: https://${name}\nOWNER: <@${session.user?.id}>`,
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
	} catch (err: any) {
		console.error(err);
		return NextResponse.json(
			{ error: err?.message || "Unknown error" },
			{ status: 500 },
		);
	}
}
