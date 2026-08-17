import type { MetadataRoute } from "next";
import { navLinks } from "@/lib/nav";
import { siteUrl } from "@/lib/site";

function collectRoutes(): string[] {
  const routes = new Set<string>();

  for (const link of navLinks) {
    routes.add(link.href);
    for (const child of link.children ?? []) {
      routes.add(child.href);
    }
  }

  return Array.from(routes);
}

export default function sitemap(): MetadataRoute.Sitemap {
  return collectRoutes().map((route) => ({
    url: `${siteUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === "/" ? "weekly" : "monthly",
    priority: route === "/" ? 1 : 0.7,
  }));
}
