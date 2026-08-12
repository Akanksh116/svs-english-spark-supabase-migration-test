/**
 * Learning progress store — favorites, learned items and practice-later marks.
 * Persisted per authenticated user in `user_learning_items` (RLS isolated).
 */
import { useCallback } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export type Bucket = "favorite" | "learned" | "practice";

export interface LearningSnapshot {
  favorite: Record<string, string[]>;
  learned: Record<string, string[]>;
  practice: Record<string, string[]>;
}

function emptySnapshot(): LearningSnapshot {
  return { favorite: {}, learned: {}, practice: {} };
}

async function fetchSnapshot(userId: string): Promise<LearningSnapshot> {
  const { data, error } = await supabase
    .from("user_learning_items")
    .select("bucket, namespace, item_id")
    .eq("user_id", userId);
  if (error) throw new Error(error.message);

  const snapshot = emptySnapshot();
  for (const row of data ?? []) {
    const bucket = row.bucket as Bucket;
    if (!snapshot[bucket]) continue;
    (snapshot[bucket][row.namespace] ??= []).push(row.item_id);
  }
  return snapshot;
}

function useSnapshot() {
  const { user } = useAuth();
  const userId = user?.id;
  const query = useQuery({
    queryKey: ["learning-items", userId],
    queryFn: () => fetchSnapshot(userId!),
    enabled: Boolean(userId),
  });
  return { snapshot: query.data ?? emptySnapshot(), userId, loading: query.isLoading };
}

export function useLearningBucket(bucket: Bucket, namespace: string) {
  const { snapshot, userId } = useSnapshot();
  const queryClient = useQueryClient();
  const ids = snapshot[bucket][namespace] ?? [];

  const mutation = useMutation({
    mutationFn: async ({ id, active }: { id: string; active: boolean }) => {
      if (!userId) return;
      if (active) {
        const { error } = await supabase
          .from("user_learning_items")
          .delete()
          .eq("user_id", userId)
          .eq("bucket", bucket)
          .eq("namespace", namespace)
          .eq("item_id", id);
        if (error) throw new Error(error.message);
      } else {
        const { error } = await supabase
          .from("user_learning_items")
          .upsert(
            { user_id: userId, bucket, namespace, item_id: id },
            { onConflict: "user_id,bucket,namespace,item_id" },
          );
        if (error) throw new Error(error.message);
      }
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["learning-items"] });
    },
  });

  const toggle = useCallback(
    (id: string) => {
      mutation.mutate({ id, active: ids.includes(id) });
    },
    [ids, mutation],
  );

  const has = useCallback((id: string) => ids.includes(id), [ids]);

  return { ids, toggle, has, count: ids.length };
}

export function useLearningTotals() {
  const { snapshot, loading } = useSnapshot();
  const sum = (b: Bucket) => Object.values(snapshot[b]).reduce((n, arr) => n + arr.length, 0);
  return {
    favorites: sum("favorite"),
    learned: sum("learned"),
    practice: sum("practice"),
    snapshot,
    loading,
  };
}
