import "dotenv/config";

const email = process.env.SEED_USER_EMAIL ?? "admin@example.com";
const password = process.env.SEED_USER_PASSWORD ?? "StrongPass123!";
const name = process.env.SEED_USER_NAME ?? "Admin";

async function main() {
  const base = process.env.BETTER_AUTH_URL ?? "http://localhost:3000";
  const url = `${base.replace(/\/$/, "")}/api/auth/sign-up/email`;

  console.log(`Attempting to seed user at: ${url}`);

  const res = await fetch(url, {
    method: "POST",
    headers: { 
      "content-type": "application/json",
      // --- ADD THIS LINE ---
      "Origin": base 
    },
    body: JSON.stringify({ email, password, name }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Sign up failed: ${res.status} ${text}`);
  }

  try {
    const data = await res.json();
    console.log("User created successfully:", data);
  } catch (e) {
    console.log("User created (no JSON response)");
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});