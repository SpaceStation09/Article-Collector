import { prisma } from "@/lib/prisma";

export async function deleteUnusedTags() {
  await prisma.tag.deleteMany({
    where: {
      articles: {
        none: {},
      },
    },
  });
}
