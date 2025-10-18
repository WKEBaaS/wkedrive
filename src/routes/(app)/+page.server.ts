import { authClient } from "$lib/auth-client";
import { type Actions, fail, redirect } from "@sveltejs/kit";

// export const load: PageServerLoad = async ({ locals }) => {
//   if (locals.session) {
//     return redirect(302, "/dashboard");
//   }
// };

export const actions = {
  signInWithGoogle: async (event) => {
    console.log("Initiating Google sign-in...");
    const resp = await authClient.signIn.social({
      provider: "google",
      fetchOptions: { credentials: "include" },
      callbackURL: event.url.origin,
    });

    console.log("Google sign-in response:", resp);

    if (resp.data?.url) {
      throw redirect(303, resp.data.url);
    }

    return fail(500, { error: "Failed to initiate Google sign-in." });
  },
} satisfies Actions;
