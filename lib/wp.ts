import { GraphQLClient, type Variables, type RequestDocument } from "graphql-request";

const endpoint = process.env.NEXT_PUBLIC_WP_GRAPHQL_URL ?? "";

export const wpClient = new GraphQLClient(endpoint);

export async function wpFetch<T = unknown, V extends Variables = Variables>(
  query: RequestDocument,
  variables?: V,
): Promise<T> {
  if (!endpoint) {
    throw new Error(
      "NEXT_PUBLIC_WP_GRAPHQL_URL is not set. Add it to .env.local.",
    );
  }
  return wpClient.request<T>(query, variables);
}
