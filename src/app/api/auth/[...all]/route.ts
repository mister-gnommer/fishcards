import { getAuth } from "@/auth/server";

// Not `toNextJsHandler(getAuth())` at module level: the auth instance needs the request's bindings.
export function GET(request: Request) {
  return getAuth().handler(request);
}

export const POST = GET;
