import pg from 'pg';
import bcrypt from 'bcryptjs';

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

const roster = [
  { name: 'Murph', password: 'spaghetti' },
  { name: 'Max', password: 'max-pwd' },
  { name: 'Mango', password: 'mango-pwd' },
  { name: 'Patty', password: 'patty-pwd' },
  { name: 'Hippie', password: 'hippie-pwd' },
  { name: 'Pickle', password: 'pickle-pwd' },
  { name: 'Ryan', password: 'ryan-pwd' },
  { name: 'Parker', password: 'parker-pwd' },
  { name: 'Dan', password: 'dan-pwd' },
  { name: 'Hoag', password: 'hoag-pwd' },
  { name: 'jb', password: 'test' },
];

for (const e of roster) {
  const hash = await bcrypt.hash(e.password, 10);
  const id = crypto.randomUUID().replace(/-/g, '').slice(0, 25);
  await pool.query(
    `INSERT INTO "Friend" (id, name, "hashedPassword", status, "cachedTraits", "createdAt")
     VALUES ($1, $2, $3, 'locked', '[]', NOW())
     ON CONFLICT (name) DO NOTHING`,
    [id, e.name, hash]
  );
  console.log('OK', e.name);
}

await pool.end();
console.log('Done');
