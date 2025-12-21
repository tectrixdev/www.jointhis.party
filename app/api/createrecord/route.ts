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

		let targetHost = String(value);

		// If SRV record, create a random A record first
		if (type === "SRV") {
			const randomSubdomain = `srv-${Math.random().toString(36).substring(2, 9)}`;
			targetHost = `${randomSubdomain}.jointhis.party`;

			await client.dns.records.create({
				zone_id: "fc5602181bbb84839aef4907714f435c",
				name: randomSubdomain,
				type: "A",
				ttl: 3600,
				content: String(value),
				comment: session.user?.id ?? undefined,
			});
		}

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
				target: targetHost,
			};
			delete payload.content;
		}

		const recordResponse = await client.dns.records.create(payload);
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
