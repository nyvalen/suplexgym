import { NewsDTO } from "@/app/types";

interface NewsListProps {
  news: NewsDTO[];
  renderItem?: (news: NewsDTO) => React.ReactNode;
}

export function NewsList({ news, renderItem }: NewsListProps) {
  return <></>;
}
