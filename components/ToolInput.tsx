// TODO: Cleanup

"use client";
import toast from "react-hot-toast";
import { useEffect, useState } from "react";
import { Trash } from "lucide-react";

// manager
type RecordItem = {
  id: string;
  name: string;
  type: string;
  content?: string;
  data?: any;
};

export default function Tool() {
  const [loading, setLoading] = useState(false);
  const [records, setRecords] = useState<RecordItem[]>([]);
  const [loadingRecords, setLoadingRecords] = useState(false);

  // form
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
        fetchRecords();
      }
    } catch (err: any) {
      toast.error(err?.message || "Network error");
    } finally {
      setLoading(false);
    }
  }

  // Manager
  async function fetchRecords() {
    setLoadingRecords(true);
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
      toast.error("Unexpected error, try again in one minute.");
    } finally {
      setLoadingRecords(false);
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
    <>
      {/* Record form */}
      <form
        onSubmit={onSubmit}
        className="mx-auto flex w-full flex-col gap-4 rounded-lg border border-white bg-black/25 p-10 text-white backdrop-blur-lg md:w-5/6"
      >
        <div className="flex flex-col gap-2">
          <label htmlFor="name" className="font-semibold">
            Subdomain name
          </label>
          <input
            className="rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-amber-400 focus:outline-none"
            id="name"
            name="name"
            required
            placeholder="mycoolserver"
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="font-semibold" htmlFor="type">
            Record type
          </label>
          <select
            className="rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-amber-400 focus:outline-none"
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
            className="rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-amber-400 focus:outline-none"
            id="value"
            name="value"
            required
            placeholder="169.134.121.60"
          />
          <label className="font-semibold" htmlFor="port">
            Port (SRV-only)
          </label>
          <input
            className="rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-amber-400 focus:outline-none"
            id="port"
            name="port"
            type="number"
            placeholder="2345"
          />
        </div>
        <button
          className="h-16 cursor-pointer rounded-md border-b border-amber-500 bg-amber-400 px-4 py-2 font-bold text-black [box-shadow:0_10px_0_0_#fd9a00,0_15px_0_0_#fd9a00] transition-all duration-150 select-none active:translate-y-2 active:border-b-0 active:[box-shadow:0_0px_0_0_#fd9a00,0_0px_0_0_#fd9a00]"
          type="submit"
          disabled={loading}
        >
          {loading ? "Creating..." : "Create Record"}
        </button>
      </form>
      {/* Record Manager */}
      <div className="mx-auto mt-10 flex w-full flex-col gap-4 rounded-lg border border-white bg-black/25 p-5 text-center text-white backdrop-blur-lg md:w-5/6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-2xl font-semibold">Your DNS Records</h3>
          <div className="flex gap-2">
            <button
              onClick={() => fetchRecords()}
              className="ml-5 rounded bg-amber-400 px-3 py-1 text-black"
            >
              Refresh
            </button>
          </div>
        </div>

        {loadingRecords ? (
          <div>Loading...</div>
        ) : records.length === 0 ? (
          <div className="text-muted">No records found.</div>
        ) : (
          <div className="space-y-3">
            {records.map((r) => (
              <div
                key={r.id}
                className="mx-auto flex w-full items-start justify-between rounded-lg border border-white p-3"
              >
                <div className="flex content-center justify-center gap-5 self-center text-center align-middle">
                  <div className="font-medium">{r.name}</div>
                  {/* <div className="text-sm text-white font-bold">{r.type}</div>
								<div className="mt-2 text-sm text-slate-200">
									{r.type === "SRV" ? r.data?.target || r.content : r.content}
								</div> */}
                </div>
                <button
                  onClick={() => handleDelete(r.id)}
                  className="ml-4 h-full rounded bg-red-600 px-3 py-1 text-white"
                >
                  <Trash />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
