-- CreateIndex
CREATE INDEX "Article_createdAt_idx" ON "public"."Article"("createdAt");

-- CreateIndex
CREATE INDEX "Article_language_createdAt_idx" ON "public"."Article"("language", "createdAt");

-- CreateIndex
CREATE INDEX "ArticleTag_tagId_idx" ON "public"."ArticleTag"("tagId");
