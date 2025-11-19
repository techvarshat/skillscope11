(async ()=>{
  const key = process.env.OPENROUTER_KEY || '';
  if(!key){
    console.error('OPENROUTER_KEY not set');
    process.exit(2);
  }
  try{
    const preferred = process.env.PREFERRED_OPENROUTER_MODEL || 'openai/gpt-oss-safeguard-20b';
    console.log('Using model:', preferred);
    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${key}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: preferred,
        messages: [
          { role: 'system', content: 'You are a test assistant.' },
          { role: 'user', content: 'Return a JSON object like {"test": true, "msg": "ok"} and nothing else.' }
        ],
        max_tokens: 200
      })
    });
    const text = await res.text();
    console.log('HTTP', res.status, res.statusText);
    console.log('BODY:\n', text);
  } catch (e) {
    console.error('Request failed:', e);
  }
})();
