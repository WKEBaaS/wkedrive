import { authClient } from "$lib/auth-client";
import { type Handle } from "@sveltejs/kit";

const handleAuth: Handle = async ({ event, resolve }) => {
  const session = await authClient.getSession({
    fetchOptions: {
      headers: event.request.headers,
    },
  });

  event.locals.session = session.data?.session;
  event.locals.user = session.data?.user;

  return resolve(event);
};

export const handle: Handle = handleAuth;
