import { baseUrl } from "@/lib/metadata";
import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      crawlDelay: 60,
    },
    sitemap: `${baseUrl}sitemap.xml`,
    host: `${baseUrl}`,
  };
}
