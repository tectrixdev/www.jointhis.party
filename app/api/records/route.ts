"use server";
import Cloudflare from "cloudflare";
import { NextResponse } from "next/server";
import { auth } from "@/auth";

export async function GET(request: Request) {
	try {
		const session = await auth();
		if (!session) {
			return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
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

		return NextResponse.json({ userRecords }, { status: 200 });
	} catch (err: any) {
		console.error(err);
		return NextResponse.json(
			{ error: err?.errors[0].message || "Unknown error" },
			{ status: 500 },
		);
	}
}

// editing records
export async function POST(request: Request) {
	try {
		const session = await auth();
		if (!session) {
			return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
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

		return NextResponse.json({ userRecords }, { status: 200 });
	} catch (err: any) {
		console.error(err);
		return NextResponse.json(
			{ error: err?.errors[0].message || "Unknown error" },
			{ status: 500 },
		);
	}
}
