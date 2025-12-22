"use client";
import React, { useState } from "react";
import toast from "react-hot-toast";

export default function RecordForm() {
	const [loading, setLoading] = useState(false);

	async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
		e.preventDefault();
		setLoading(true);
		const fd = new FormData(e.currentTarget);
		const payload = {
			name: fd.get("name"),
			type: fd.get("type"),
			value: fd.get("value"),
			port: fd.get("port"),
		};

		try {
			const res = await fetch("/api/records", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(payload),
			});
			const data = await res.json();
			if (!res.ok) {
				toast.error(data?.error || "Failed to create record");
			} else {
				toast.success("Record created");
			}
		} catch (err: any) {
			toast.error(err?.message || "Network error");
		} finally {
			setLoading(false);
		}
	}

	return (
		<>
			<form
				onSubmit={onSubmit}
				className="text-white flex flex-col gap-4 w-full mx-auto bg-black/25 backdrop-blur-lg p-10 rounded-lg md:w-5/6 border-white border"
			>
				<div className="flex flex-col gap-2">
					<label htmlFor="name" className="font-semibold">
						Subdomain Name
					</label>
					<input
						className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-400"
						id="name"
						name="name"
						required
						placeholder="mycoolserver"
					/>
				</div>
				<div className="flex flex-col gap-2">
					<label className="font-semibold" htmlFor="type">
						Record Type
					</label>
					<select
						className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-400"
						id="type"
						name="type"
						required
					>
						<option value="">Select a type</option>
						<option value="A">A</option>
						<option value="AAAA">AAAA</option>
						<option value="CNAME">CNAME</option>
						<option value="TXT">TXT</option>
						<option value="SRV">SRV</option>
					</select>
				</div>
				<div className="flex flex-col gap-2">
					<label className="font-semibold" htmlFor="value">
						Value
					</label>
					<input
						className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-400"
						id="value"
						name="value"
						required
						placeholder="169.134.121.60"
					/>
					<label className="font-semibold" htmlFor="port">
						Minecraft port (SRV-only)
					</label>
					<input
						className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-400"
						id="port"
						name="port"
						type="number"
						placeholder="2345"
					/>
				</div>
				<button
					className="px-4 py-2 bg-amber-400 text-black font-bold rounded-md hover:bg-amber-500 transition-colors"
					type="submit"
					disabled={loading}
				>
					{loading ? "Creating..." : "Create Record"}
				</button>
			</form>
		</>
	);
}
