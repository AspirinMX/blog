import fs from "node:fs";
import path from "node:path";
import { load as parseYaml } from "js-yaml";
import { siteConfigSchema, type SiteConfig } from "./schemas";

const SITE_CONFIG_PATH = path.join(process.cwd(), "content", "site.yaml");

export function getSiteConfig(): SiteConfig {
  const raw = fs.readFileSync(SITE_CONFIG_PATH, "utf-8");
  const parsed = parseYaml(raw);
  const result = siteConfigSchema.safeParse(parsed);

  if (!result.success) {
    throw new Error(
      `Invalid content/site.yaml configuration: ${result.error.message}`
    );
  }

  return result.data;
}
