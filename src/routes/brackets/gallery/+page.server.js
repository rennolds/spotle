import { getCurrentBracket } from "$lib/bracketHelpers.js";

/** @type {import('./$types').PageServerLoad} */
export async function load({ locals: { supabase } }) {
  // Get the current live bracket so we can identify it on the front-end.
  const currentBracket = await getCurrentBracket(supabase);

  // Fetch all brackets, ordered from newest to oldest.
  const { data: allBrackets, error } = await supabase
    .from("brackets")
    .select("*")
    .order("anchor_sunday", { ascending: false });

  if (error) {
    console.error("Error fetching brackets for gallery:", error);
    return { brackets: [], currentBracketId: null };
  }

  return {
    brackets: allBrackets,
    currentBracketId: currentBracket?.id || null,
  };
}
