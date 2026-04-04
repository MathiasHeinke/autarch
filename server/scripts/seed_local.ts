import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { authUsers } from '@paperclipai/db';
import { v4 as uuidv4 } from 'uuid';

const connectionString = process.env.DATABASE_URL || 'postgres://paperclip:paperclip@localhost:5432/paperclip';
const queryClient = postgres(connectionString);
const db = drizzle(queryClient);

async function seed() {
    try {
        console.log("Seeding deep-e2e user to local DB...");
        const userId = uuidv4();
        await db.insert(authUsers).values({
            id: userId,
            email: 'deep-e2e@bio-os.io',
            name: 'Deep E2E Bot',
            emailVerified: true,
            createdAt: new Date(),
            updatedAt: new Date()
        });
        console.log(`Seeded user successfully. ID: ${userId}`);
    } catch (err) {
        console.error("Error seeding:", err);
    } finally {
        await queryClient.end();
        process.exit(0);
    }
}
seed();
