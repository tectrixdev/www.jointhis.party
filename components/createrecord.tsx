"use server";
import Cloudflare from "cloudflare";
import { signIn } from "@/auth";
import { auth } from "@/auth";

export async function createrecord(formData: FormData) {
	const client = new Cloudflare({
		apiToken: process.env["CLOUDFLARE_API_TOKEN"], // This is the default and can be omitted
	});
	// for await (const recordResponse of client.dns.records.list({
	// 	zone_id: "fc5602181bbb84839aef4907714f435c",
	// })) {
	// 	console.log(recordResponse);
	// }
	const session = await auth();
	if (session) {
		try {
			const recordResponse = await client.dns.records.create({
				zone_id: "fc5602181bbb84839aef4907714f435c",
				name: `${formData.get("name")}`,
				ttl: 3600,
				type: formData.get("type") as
					| "A"
					| "AAAA"
					| "CNAME"
					| "MX"
					| "NS"
					| "OPENPGPKEY"
					| "PTR"
					| "TXT"
					| "CAA"
					| "CERT"
					| "DNSKEY"
					| "DS"
					| "HTTPS"
					| "LOC"
					| "NAPTR"
					| "SMIMEA"
					| "SRV"
					| "SSHFP"
					| "SVCB"
					| "TLSA"
					| "URI",
				comment: `${session?.user?.id || null}`,
			});
		} catch (error) {
			console.error(error);
		}
	} else {
		await signIn();
	}
}
