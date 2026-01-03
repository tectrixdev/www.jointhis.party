// TODO: Cleanup

"use client";
import toast from "react-hot-toast";
import { useEffect, useState } from "react";
import { Trash } from "lucide-react";
import { Grid } from "ldrs/react";
import "ldrs/react/Grid.css";
import { Zoomies } from "ldrs/react";
import "ldrs/react/Zoomies.css";

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
  const [recordType, setrecordType] = useState("");

  // form
  const options = [
    { id: "0", name: "A" },
    { id: "1", name: "AAAA" },
    { id: "2", name: "CNAME" },
    { id: "3", name: "TXT" },
    { id: "4", name: "SRV" },
  ];

  const handleChange = (event: any) => {
    setrecordType(event.target.value);
  };

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
        className="mx-auto flex w-full flex-col gap-4 rounded-lg bg-white/50 px-5 py-10 text-black backdrop-blur-xl md:w-5/6 dark:bg-black/50 dark:text-white"
      >
        <div className="flex flex-col gap-2">
          <label htmlFor="name" className="font-semibold">
            Subdomain name
          </label>
          <input
            className="rounded-md border border-black px-3 py-2 focus:ring-2 focus:ring-amber-400 focus:outline-none dark:border-gray-300"
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
            value={recordType}
            onChange={handleChange}
            className="rounded-md border border-black px-3 py-2 focus:ring-2 focus:ring-amber-400 focus:outline-none dark:border-gray-300"
            id="type"
            name="type"
            required
          >
            {options.map((option) => (
              <option key={option.id} value={`${option.name}`}>
                {option.name}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-2">
          <label className="font-semibold" htmlFor="value">
            Value
          </label>
          <input
            className="rounded-md border border-black px-3 py-2 focus:ring-2 focus:ring-amber-400 focus:outline-none dark:border-gray-300"
            id="value"
            name="value"
            required
            placeholder="169.134.121.60"
          />
          {recordType == "SRV" ? (
            <>
              <label className="font-semibold" htmlFor="port">
                Port
              </label>
              <input
                className="rounded-md border border-black px-3 py-2 focus:ring-2 focus:ring-amber-400 focus:outline-none dark:border-gray-300"
                id="port"
                name="port"
                type="number"
                placeholder="2345"
              />
            </>
          ) : (
            ``
          )}
        </div>
        <button
          className="h-16 cursor-pointer rounded-md border-b border-amber-500 bg-amber-400 px-4 py-2 font-bold text-black [box-shadow:0_10px_0_0_#fd9a00,0_15px_0_0_#fd9a00] transition-all duration-150 select-none active:translate-y-2 active:border-b-0 active:[box-shadow:0_0px_0_0_#fd9a00,0_0px_0_0_#fd9a00]"
          type="submit"
          disabled={loading}
        >
          {loading ? (
            <Zoomies
              size="250"
              stroke="5"
              bgOpacity="0.1"
              speed="1.4"
              color="black"
            />
          ) : (
            "Create Record"
          )}
        </button>
      </form>
      {/* Record Manager */}
      <div className="mx-auto mt-2 flex w-full flex-col gap-4 rounded-lg bg-white/50 px-5 py-10 text-black backdrop-blur-xl md:w-5/6 dark:bg-black/50 dark:text-white">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-2xl font-semibold">Your DNS Records</h3>
          <div className="flex gap-2">
            <button
              onClick={() => fetchRecords()}
              className="-mt-2.5 cursor-pointer rounded-md border-b border-amber-500 bg-amber-400 px-4 py-2 font-bold text-black [box-shadow:0_5px_0_0_#fd9a00,0_10px_0_0_#fd9a00] transition-all duration-150 select-none active:translate-y-2 active:border-b-0 active:[box-shadow:0_0px_0_0_#fd9a00,0_0px_0_0_#fd9a00]"
            >
              Refresh
            </button>
          </div>
        </div>

        {loadingRecords ? (
          <div className="m-5 flex w-full items-center justify-center">
            <Grid size="60" speed="1.5" color="white" />
          </div>
        ) : records.length === 0 ? (
          <div className="text-muted">No records found.</div>
        ) : (
          <div className="space-y-3">
            {records.map((r) => (
              <div
                key={r.id}
                className="mx-auto flex w-full items-start justify-between rounded-lg border border-black p-3 dark:border-gray-300"
              >
                <div className="flex content-center justify-center gap-5 self-center text-center align-middle">
                  <div className="font-medium">{r.name}</div>
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
