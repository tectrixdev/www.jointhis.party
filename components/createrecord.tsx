"use server";
import { signIn } from "@/auth";
import { auth } from "@/auth";
export async function createrecord(formData: FormData) {
	"use server";

	const rawFormData = {
		name: formData.get("name"),
		type: formData.get("type"),
		value: formData.get("value"),
		port: formData.get("port"),
	};
	const session = await auth();
	if (session) {
	} else {
		await signIn();
	}
}
