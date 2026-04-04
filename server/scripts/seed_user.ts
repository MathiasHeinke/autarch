import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://sdukmitswmvbcznhpskm.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
if (!supabaseKey) {
    console.error("Please provide SUPABASE_SERVICE_ROLE_KEY or SUPABASE_ANON_KEY env var");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
    console.log("Creating test user deeply E2E Bot...");
    const { data: user, error: userError } = await supabase.auth.admin.createUser({
        email: 'deep-e2e@bio-os.io',
        password: 'Password123!',
        email_confirm: true,
        user_metadata: {
            name: "Deep E2E Bot",
            system_test: true
        }
    });

    if (userError) {
        console.error("Error creating user:", userError);
        process.exit(1);
    }
    
    console.log("User created:", user.user.id);
}

main().catch(console.error);
