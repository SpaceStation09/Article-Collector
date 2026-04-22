export type ArticleListItem = {
  id: string;
  url: string;
  title: string;
  language?: "ZH" | "EN";
  titleSource: "AUTO" | "MANUAL";
  createdAt: string;
  tags: { id: string; name: string }[];
};

export type ArticleTagItem = {
  id: string;
  name: string;
};
