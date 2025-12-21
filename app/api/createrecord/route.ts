"use server";
import Cloudflare from "cloudflare";
import { NextResponse } from "next/server";
import { auth } from "@/auth";

export async function POST(request: Request) {
	try {
		const session = await auth();
		if (!session) {
			return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
		}

		const body = await request.json();
		const { name, type, value, port } = body;

		const client = new Cloudflare({
			apiToken: process.env["CLOUDFLARE_API_TOKEN"],
		});

		const payload: any = {
			zone_id: "fc5602181bbb84839aef4907714f435c",
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
