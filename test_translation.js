const https = require('https');

function translate(text) {
  const clean = encodeURIComponent(text.toLowerCase().trim());
  const url = `https://api.mymemory.translated.net/get?q=${clean}&langpair=es|en`;
  
  https.get(url, (res) => {
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
      try {
        const parsed = JSON.parse(data);
        console.log(`Translate "${text}":`, parsed.responseData ? parsed.responseData.translatedText : 'Error/No translation');
      } catch (e) {
        console.log(`Failed to parse translation for "${text}":`, e.message);
        console.log('Raw output:', data);
      }
    });
  }).on('error', (err) => {
    console.log(`Error translating "${text}":`, err.message);
  });
}

translate("limón");
translate("manzana");
translate("zanahoria");
translate("chocolate");
translate("dona");
