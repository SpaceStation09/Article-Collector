import { getPrisma } from "@/lib/prisma";

export async function deleteUnusedTags() {
  await getPrisma().tag.deleteMany({
    where: {
      articles: {
        none: {},
      },
    },
  });
}
