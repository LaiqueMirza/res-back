// OpenAI API Key Validator
// Tests multiple API keys to check validity and billing status

// 1. Paste your list of keys here
const apiKeys = [
	"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",
	"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",
	"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",
	"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",
	"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",
	"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",
];

async function testKey(apiKey) {
  if (!apiKey || apiKey.length < 10) return { key: apiKey, status: "INVALID_FORMAT" };

  try {
    // We try a minimal request to check both validity AND billing status
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: "hi" }],
        max_tokens: 1, // Minimize cost
      }),
    });

    if (response.ok) {
      return { key: apiKey, status: "WORKING" };
    } 
    
    // Parse error details
    const data = await response.json();
    
    if (response.status === 401) {
      return { key: apiKey, status: "INVALID" };
    } else if (response.status === 429) {
      return { key: apiKey, status: "QUOTA_EXCEEDED" };
    } else {
      return { key: apiKey, status: `ERROR_${response.status}`, message: data.error?.message };
    }

  } catch (error) {
    return { key: apiKey, status: "NETWORK_ERROR", message: error.message };
  }
}

async function checkAllKeys() {
  console.log(`Checking ${apiKeys.length} keys...\n`);

  // Run all checks in parallel
  const results = await Promise.all(apiKeys.map(testKey));

  // Sort and display results
  const working = results.filter(r => r.status === "WORKING");
  const quota = results.filter(r => r.status === "QUOTA_EXCEEDED");
  const invalid = results.filter(r => r.status === "INVALID");

  console.log("--- REPORT ---");
  
  if (working.length > 0) {
    console.log("\n✅ WORKING KEYS (Ready to use):");
    working.forEach(r => console.log(`   ${r.key}`));
  } else {
    console.log("\n⚠️  No working keys found.");
  }

  if (quota.length > 0) {
    console.log("\n💰 VALID BUT NO CREDIT (Quota Exceeded):");
    quota.forEach(r => console.log(`   ${r.key.substring(0, 15)}...`));
  }

  if (invalid.length > 0) {
    console.log("\n❌ INVALID KEYS:");
    invalid.forEach(r => console.log(`   ${r.key.substring(0, 15)}...`));
  }
  
  console.log("\nDone.");
}

checkAllKeys();
