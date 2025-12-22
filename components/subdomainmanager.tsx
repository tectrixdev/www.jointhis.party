"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Trash } from "lucide-react";

type RecordItem = {
	id: string;
	name: string;
	type: string;
	content?: string;
	data?: any;
};

export default function SubdomainManagerClient() {
	const [records, setRecords] = useState<RecordItem[]>([]);
	const [loading, setLoading] = useState(false);

	async function fetchRecords() {
		setLoading(true);
		try {
			const res = await fetch("/api/records");
			const json = await res.json();
			const payload =
				json?.UserRecords ||
				json?.userRecords ||
				json?.userRecords?.result ||
				[];
			const list = Array.isArray(payload) ? payload : (payload?.result ?? []);
			const mapped = (list || []).map((r: any) => ({
				id: r.id,
				name: r.name,
				type: r.type,
				content: r.content,
				data: r.data,
			}));
			setRecords(mapped);
			if (!res.ok) {
				toast.error(json?.error || "Failed to fetch records.");
			}
		} catch (err: any) {
			console.error(err);
			toast.error(err?.message || err || "Network error");
		} finally {
			setLoading(false);
		}
	}

	useEffect(() => {
		fetchRecords();
	}, []);

	async function handleDelete(id: string) {
		if (!confirm("Delete this record?")) return;
		const t = toast.loading("Deleting...");
		try {
			const res = await fetch("/api/records", {
				method: "DELETE",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ id }),
			});
			const json = await res.json();
			if (!res.ok) throw new Error(json?.error || "Delete failed");
			toast.success("Deleted");
			fetchRecords();
		} catch (err: any) {
			console.error(err);
			toast.error(err?.message || "Delete failed");
		} finally {
			toast.dismiss(t);
		}
	}

	return (
		<div className="text-white w-full flex flex-col gap-4 mx-auto bg-black/25 text-center backdrop-blur-lg p-5 rounded-lg md:w-5/6 border-white border mt-10">
			<div className="flex items-center justify-between mb-4">
				<h3 className="text-2xl font-semibold">Your DNS Records</h3>
				<div className="flex gap-2">
					<button
						onClick={() => fetchRecords()}
						className="px-3 py-1 ml-5 bg-amber-400  text-black rounded"
					>
						Refresh
					</button>
				</div>
			</div>

			{loading ? (
				<div>Loading...</div>
			) : records.length === 0 ? (
				<div className="text-muted">No records found.</div>
			) : (
				<div className="space-y-3">
					{records.map((r) => (
						<div
							key={r.id}
							className="p-3 border border-white rounded-lg w-full mx-auto flex items-start justify-between"
						>
							<div className="flex gap-5 justify-center align-middle self-center content-center text-center ">
								<div className="font-medium">{r.name}</div>
								{/* <div className="text-sm text-white font-bold">{r.type}</div>
								<div className="mt-2 text-sm text-slate-200">
									{r.type === "SRV" ? r.data?.target || r.content : r.content}
								</div> */}
							</div>
							<button
								onClick={() => handleDelete(r.id)}
								className="ml-4 h-full px-3 py-1 bg-red-600 text-white rounded"
							>
								<Trash />
							</button>
						</div>
					))}
				</div>
			)}
		</div>
	);
}
