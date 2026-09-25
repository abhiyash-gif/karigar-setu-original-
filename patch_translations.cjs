const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/i18n/translations.ts');
let content = fs.readFileSync(filePath, 'utf8');

const newEnKeys = `
    saathiGreeting: "Namaste! 🙏 I’m Karigar Saathi. I can help you add products, create descriptions, check prices, manage orders, and sell your crafts.",
    saathiAddProduct: "Sure! 📸 Let’s add your craft. You can take a photo or upload one, and I’ll help you create the product details.",
    saathiDescription: "Tell me about your craft in your own words. You can type it or use the microphone, and I’ll help turn it into a professional product description.",
    saathiPricing: "I can help estimate a suitable price using your product details, materials, effort, and available market information. 💰",
    saathiSelling: "You can publish your craft through Sell Direct and share your product with customers. 🛍️",
    saathiOrders: "Let me check your orders. 📦 You can also open the Orders section to see your latest purchases and order status.",
    saathiSellDirect: "Great! 🛍️ You can publish your product on Sell Direct and share it directly with customers.",
    saathiMarketLinkage: "Karigar Setu helps connect your craft with potential customers through digital product listings and direct selling. 🌍",
    saathiHelpAction: "I can help you with products, descriptions, pricing, orders, selling, and navigating Karigar Setu.",
    saathiThankYou: "You’re welcome! 😊 Keep creating and sharing your craft.",
    saathiUnknown: "I’m not sure I understood that. You can ask me about adding a product, pricing, orders, or selling your craft.",
    saathiApiUnavailable: "I’m having trouble connecting right now. Please try again in a moment, or choose an option below.",
    qaAddProduct: "📸 Add Product",
    qaCreateDescription: "📝 Create Description",
    qaCheckPrice: "💰 Check Price",
    qaMyOrders: "📦 My Orders",
    qaSellDirect: "🛍️ Sell Direct",
    qaHowItWorks: "❓ How does Karigar Setu work?",
`;

const newHiKeys = `
    saathiGreeting: "नमस्ते! 🙏 मैं कारीगर साथी हूँ। मैं आपको उत्पाद जोड़ने, विवरण बनाने, कीमतें जांचने, ऑर्डर प्रबंधित करने और अपने शिल्प बेचने में मदद कर सकता हूँ।",
    saathiAddProduct: "बिल्कुल! 📸 चलिए आपका शिल्प जोड़ते हैं। आप एक फोटो ले सकते हैं या अपलोड कर सकते हैं, और मैं उत्पाद विवरण बनाने में मदद करूँगा।",
    saathiDescription: "मुझे अपने शिल्प के बारे में अपने शब्दों में बताएं। आप इसे टाइप कर सकते हैं या माइक्रोफ़ोन का उपयोग कर सकते हैं, और मैं इसे एक पेशेवर उत्पाद विवरण में बदलने में मदद करूँगा।",
    saathiPricing: "मैं आपके उत्पाद के विवरण, सामग्री, प्रयास और उपलब्ध बाजार की जानकारी का उपयोग करके एक उपयुक्त मूल्य का अनुमान लगाने में मदद कर सकता हूँ। 💰",
    saathiSelling: "आप सेल डायरेक्ट के माध्यम से अपना शिल्प प्रकाशित कर सकते हैं और अपने उत्पाद को ग्राहकों के साथ साझा कर सकते हैं। 🛍️",
    saathiOrders: "मुझे आपके ऑर्डर जांचने दें। 📦 आप अपनी नवीनतम खरीदारी और ऑर्डर की स्थिति देखने के लिए ऑर्डर अनुभाग भी खोल सकते हैं।",
    saathiSellDirect: "बहुत बढ़िया! 🛍️ आप सेल डायरेक्ट पर अपना उत्पाद प्रकाशित कर सकते हैं और इसे सीधे ग्राहकों के साथ साझा कर सकते हैं।",
    saathiMarketLinkage: "कारीगर सेतु डिजिटल उत्पाद लिस्टिंग और सीधी बिक्री के माध्यम से आपके शिल्प को संभावित ग्राहकों से जोड़ने में मदद करता है। 🌍",
    saathiHelpAction: "मैं आपको उत्पादों, विवरणों, मूल्य निर्धारण, ऑर्डर, बिक्री और कारीगर सेतु को नेविगेट करने में मदद कर सकता हूँ।",
    saathiThankYou: "आपका स्वागत है! 😊 अपना शिल्प बनाते और साझा करते रहें।",
    saathiUnknown: "मुझे यकीन नहीं है कि मैं वह समझ पाया। आप मुझसे उत्पाद जोड़ने, मूल्य निर्धारण, ऑर्डर या अपना शिल्प बेचने के बारे में पूछ सकते हैं।",
    saathiApiUnavailable: "मुझे अभी कनेक्ट करने में परेशानी हो रही है। कृपया कुछ क्षणों में फिर से प्रयास करें, या नीचे एक विकल्प चुनें।",
    qaAddProduct: "📸 उत्पाद जोड़ें",
    qaCreateDescription: "📝 विवरण बनाएं",
    qaCheckPrice: "💰 कीमत जांचें",
    qaMyOrders: "📦 मेरे ऑर्डर",
    qaSellDirect: "🛍️ सीधे बेचें",
    qaHowItWorks: "❓ कारीगर सेतु कैसे काम करता है?",
`;

content = content.replace(/en: {/, 'en: {\n' + newEnKeys);
content = content.replace(/hi: {/, 'hi: {\n' + newHiKeys);

fs.writeFileSync(filePath, content);
console.log('Translations updated.');
