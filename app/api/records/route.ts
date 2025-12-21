"use server";
import Cloudflare from "cloudflare";
import { NextResponse } from "next/server";
import { auth } from "@/auth";

const client = new Cloudflare({
	apiToken: process.env["CLOUDFLARE_API_TOKEN"],
});
const ZONE_ID = "fc5602181bbb84839aef4907714f435c";

// list user owned subdomains
export async function GET(request: Request) {
	try {
		const session = await auth();
		if (!session) {
			return NextResponse.json({ error: "Please log in." }, { status: 401 });
		}

		const client = new Cloudflare({
			apiToken: process.env["CLOUDFLARE_API_TOKEN"],
		});

		const userRecords = await client.dns.records.list({
			zone_id: "fc5602181bbb84839aef4907714f435c",
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

//delete
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
			zone_id: "fc5602181bbb84839aef4907714f435c",
		});
		const name = record.name;
		const value = record.content;
		const type = record.type;
		const deleteRecord = await client.dns.records.delete(`${id}`, {
			zone_id: "fc5602181bbb84839aef4907714f435c",
		});
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
			zone_id: "fc5602181bbb84839aef4907714f435c",
		});
		const name = record.name;
		const type = record.type;
		const payload: any = {
			name: name ? String(name) : undefined,
			type: type ? String(type) : undefined,
			ttl: 3600,
			comment: session.user?.id ?? undefined,
		};

		if (type === "SRV") {
			payload.data = {
				name: `_minecraft._tcp.${String(name)}`,
				priority: 0,
				weight: 0,
				port: Number(port || 0),
				target: String(value),
			};
		} else if (value !== undefined) {
			payload.content = String(value);
		}

		// Remove undefined keys
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

// create subdomain
export async function POST(request: Request) {
	try {
		const session = await auth();
		if (!session) {
			return NextResponse.json({ error: "Please log in." }, { status: 401 });
		}

		const body = await request.json();
		const { name, type, value, port } = body;

		const payload: any = {
			zone_id: ZONE_ID,
			name: String(name),
			type: String(type),
			ttl: 3600,
			content: String(value),
			comment: session.user?.id ?? undefined,
		};

		if (type === "SRV") {
			payload.data = {
				name: `_minecraft._tcp.${String(name)}`,
				priority: 0,
				weight: 0,
				port: Number(port || 0),
				target: String(value),
			};
			delete payload.content;
		}

		const recordResponse = await client.dns.records.create(payload);
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
