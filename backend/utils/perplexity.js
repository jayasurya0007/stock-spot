export async function rewriteQueryWithPerplexity(query) {
  try {
    const response = await fetch("https://api.perplexity.ai/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.PERPLEXITY_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "sonar",
        messages: [
          { 
            role: "system", 
            content: "You are a helpful assistant that rewrites user queries into precise product search keywords. Return only the refined search term without any additional text." 
          },
          { role: "user", content: query }
        ],
        max_tokens: 30
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP error! Status: ${response.status}, Response: ${errorText}`);
    }

    const data = await response.json();
    if (data.choices && data.choices.length > 0) {
      return data.choices[0].message.content.trim();
    } else {
      throw new Error("No choices found in the response.");
    }
  } catch (error) {
    console.error("Error in Perplexity API:", error);
    return query; // fallback to original query
  }
}