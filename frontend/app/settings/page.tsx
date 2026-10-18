import { redirect } from "next/navigation";

interface PageProps {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

/**
 * SYS-12 Canonical Settings Compatibility Handler
 *
 * Directs navigation to canonical profile & account settings editor (/settings/edit),
 * preserving any deep-link query parameters (e.g. ?tab=career, ?tab=coding).
 */
export default async function SettingsPage({ searchParams }: PageProps) {
  const params = searchParams ? await searchParams : {};
  const qs = new URLSearchParams();

  for (const [key, val] of Object.entries(params)) {
    if (typeof val === "string") {
      qs.set(key, val);
    } else if (Array.isArray(val)) {
      val.forEach((v) => qs.append(key, v));
    }
  }

  const queryString = qs.toString();
  redirect(queryString ? `/settings/edit?${queryString}` : "/settings/edit");
}
