import { statusTone } from "@/lib/format";

export function Status({ value }: { value?: string }) {
  return <span className={`status status-${statusTone(value)}`}><i />{value || "unknown"}</span>;
}
