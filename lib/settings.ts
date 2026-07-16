import { prisma } from './prisma';

export async function getSettings(keys: string[]): Promise<Record<string, string>> {
  const rows = await prisma.settings.findMany({ where: { key: { in: keys } } });
  return Object.fromEntries(rows.map((row) => [row.key, row.value]));
}

export async function getSetting(key: string): Promise<string | undefined> {
  return (await getSettings([key]))[key];
}
