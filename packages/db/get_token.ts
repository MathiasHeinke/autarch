import { createClient } from "@supabase/supabase-js";
const supabase = createClient("https://sdukmitswmvbcznhpskm.supabase.co", process.env.SUPABASE_ANON_KEY || "");
async function main() {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: "mathias@ares-bio.com",
    password: process.env.USER_PASSWORD || "password" 
  });
  console.log(data?.session?.access_token);
}
main();
