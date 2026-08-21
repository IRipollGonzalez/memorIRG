import { useQuery } from "@tanstack/react-query";

import { apiFetch } from "@/api/client";
import { IS_STATIC } from "@/lib/env";
import { getTopic as getLocalTopic, listTopicNames, toTopicDetail } from "@/lib/local/topicsEngine";
import type { TopicDetail, TopicSummary } from "@/types/topic";

export function useTopics() {
  return useQuery({
    queryKey: ["topics"],
    queryFn: async () => (IS_STATIC ? listTopicNames() : apiFetch<TopicSummary[]>("/topics")),
  });
}

export function useTopic(name: string | null) {
  return useQuery({
    queryKey: ["topics", name],
    queryFn: async () =>
      IS_STATIC ? toTopicDetail(getLocalTopic(name!)) : apiFetch<TopicDetail>(`/topics/${encodeURIComponent(name!)}`),
    enabled: name !== null,
  });
}
