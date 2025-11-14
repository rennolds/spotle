import { error } from "@sveltejs/kit";

const isUUID = (str) => {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
};

/** @type {import('./$types').PageServerLoad} */
export async function load({ params, locals: { supabase } }) {
  const { slug } = params;

  let query = supabase.from("brackets");

  // Build the query based on whether the slug looks like a UUID
  if (isUUID(slug)) {
    query = query.select("id").or(`slug.eq.${slug},id.eq.${slug}`);
  } else {
    query = query.select("id").eq("slug", slug);
  }

  const { data: bracketData, error: dbError } = await query.single();

  if (dbError || !bracketData) {
    console.error(`Error fetching bracket ID for slug/id "${slug}":`, dbError);
    throw error(404, "Bracket not found");
  }
}
