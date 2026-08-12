export interface OfficePhrase {
  id: string;
  english: string;
  telugu: string;
  hindi: string;
  usage: string;
}

export interface OfficeSection {
  id: string;
  name: string;
  emoji: string;
  description: string;
  phrases: OfficePhrase[];
}

const mk = (g: string, list: Omit<OfficePhrase, "id">[]): OfficePhrase[] =>
  list.map((p, i) => ({ ...p, id: `${g}-${i}` }));

export const OFFICE_SECTIONS: OfficeSection[] = [
  {
    id: "reception",
    name: "Reception",
    emoji: "🛎️",
    description: "Welcome and direct people at the front desk.",
    phrases: mk("rc", [
      {
        english: "Good morning, welcome to Sri Vijaya Sai High School.",
        telugu: "శుభోదయం, శ్రీ విజయ సాయి హై స్కూల్‌కు స్వాగతం.",
        hindi: "सुप्रभात, श्री विजय साई हाई स्कूल में आपका स्वागत है।",
        usage: "Standard warm greeting at the desk.",
      },
      {
        english: "How may I help you today?",
        telugu: "ఇవాళ నేను మీకు ఎలా సహాయపడగలను?",
        hindi: "आज मैं आपकी क्या मदद कर सकता/सकती हूँ?",
        usage: "Offer help politely.",
      },
      {
        english: "Please have a seat while I check.",
        telugu: "నేను చూస్తుండగా దయచేసి కూర్చోండి.",
        hindi: "जब तक मैं देखता/देखती हूँ, कृपया बैठ जाएँ।",
        usage: "When you need a moment to verify something.",
      },
    ]),
  },
  {
    id: "visitors",
    name: "Visitors",
    emoji: "🧾",
    description: "Handle visitor registration politely.",
    phrases: mk("vs", [
      {
        english: "May I know your name and purpose of visit?",
        telugu: "మీ పేరు మరియు రావడానికి కారణం తెలుసుకోవచ్చా?",
        hindi: "क्या मैं आपका नाम और आने का उद्देश्य जान सकता/सकती हूँ?",
        usage: "Ask for basic information respectfully.",
      },
      {
        english: "Please sign the visitor register.",
        telugu: "దయచేసి సందర్శకుల రిజిస్టర్‌లో సంతకం చేయండి.",
        hindi: "कृपया विज़िटर रजिस्टर में हस्ताक्षर करें।",
        usage: "Standard entry step.",
      },
      {
        english: "Someone will attend to you shortly.",
        telugu: "ఎవరైనా త్వరలో మీ దగ్గరకు వస్తారు.",
        hindi: "कोई थोड़ी देर में आपके पास आएगा।",
        usage: "Reassure a waiting visitor.",
      },
    ]),
  },
  {
    id: "telephone",
    name: "Telephone Calls",
    emoji: "📞",
    description: "Answer school calls professionally.",
    phrases: mk("tp", [
      {
        english: "Sri Vijaya Sai High School, how can I help you?",
        telugu: "శ్రీ విజయ సాయి హై స్కూల్, నేను ఎలా సహాయపడగలను?",
        hindi: "श्री विजय साई हाई स्कूल, मैं आपकी क्या मदद कर सकता/सकती हूँ?",
        usage: "Standard call opening.",
      },
      {
        english: "May I know who is calling, please?",
        telugu: "ఎవరు మాట్లాడుతున్నారో తెలుసుకోవచ్చా?",
        hindi: "क्या मैं जान सकता/सकती हूँ कौन बोल रहा/रही है?",
        usage: "Ask for the caller politely.",
      },
      {
        english: "Please hold, I'll transfer your call.",
        telugu: "దయచేసి ఆగండి, మీ కాల్ బదిలీ చేస్తాను.",
        hindi: "कृपया रुकिए, मैं आपकी कॉल ट्रांसफर करता/करती हूँ।",
        usage: "Before switching the call.",
      },
    ]),
  },
  {
    id: "leave",
    name: "Leave Applications",
    emoji: "📄",
    description: "Handle leave-related conversations.",
    phrases: mk("lv", [
      {
        english: "Please submit a written leave application.",
        telugu: "దయచేసి రాతపూర్వక లీవ్ దరఖాస్తు ఇవ్వండి.",
        hindi: "कृपया लिखित रूप में अवकाश आवेदन जमा करें।",
        usage: "Standard request to a teacher or parent.",
      },
      {
        english: "Your leave has been approved.",
        telugu: "మీ లీవ్ ఆమోదించబడింది.",
        hindi: "आपका अवकाश स्वीकृत हो गया है।",
        usage: "Give a clear confirmation.",
      },
      {
        english: "The principal will review this and get back to you.",
        telugu: "ప్రధానోపాధ్యాయుడు దీన్ని పరిశీలించి తిరిగి తెలియజేస్తారు.",
        hindi: "प्रधानाचार्य इसे देखेंगे और आपको बताएँगे।",
        usage: "When approval is pending.",
      },
    ]),
  },
  {
    id: "fee",
    name: "Fee Discussions",
    emoji: "💳",
    description: "Discuss fees clearly and respectfully.",
    phrases: mk("fee", [
      {
        english: "The fee for this term is due by the 10th.",
        telugu: "ఈ టర్మ్ ఫీజు 10వ తేదీలోగా చెల్లించాలి.",
        hindi: "इस टर्म की फीस 10 तारीख तक जमा करनी है।",
        usage: "State the deadline plainly.",
      },
      {
        english: "You can pay at the office or by online transfer.",
        telugu: "మీరు ఆఫీసులో లేదా ఆన్‌లైన్ ద్వారా చెల్లించవచ్చు.",
        hindi: "आप कार्यालय में या ऑनलाइन ट्रांसफर से भुगतान कर सकते हैं।",
        usage: "Give payment options.",
      },
      {
        english: "Please collect a receipt after payment.",
        telugu: "చెల్లింపు తర్వాత రసీదు తీసుకోండి.",
        hindi: "भुगतान के बाद कृपया रसीद लें।",
        usage: "Reminder for record-keeping.",
      },
    ]),
  },
  {
    id: "announcements",
    name: "Announcements",
    emoji: "📢",
    description: "Make clear school-wide announcements.",
    phrases: mk("ann", [
      {
        english: "May I have your attention, please.",
        telugu: "దయచేసి మీ శ్రద్ధ ఇవ్వండి.",
        hindi: "कृपया आप सभी ध्यान दें।",
        usage: "Standard opener for announcements.",
      },
      {
        english: "Tomorrow's assembly will start at 8:15 AM.",
        telugu: "రేపటి అస్సెంబ్లీ ఉదయం 8:15 గంటలకు ప్రారంభమవుతుంది.",
        hindi: "कल की सभा सुबह 8:15 बजे शुरू होगी।",
        usage: "State the exact time.",
      },
      {
        english: "That is all for now — thank you.",
        telugu: "ప్రస్తుతానికి అంతే — ధన్యవాదాలు.",
        hindi: "फ़िलहाल इतना ही — धन्यवाद।",
        usage: "Polite closing.",
      },
    ]),
  },
  {
    id: "circulars",
    name: "Circulars",
    emoji: "📰",
    description: "Refer to printed or digital notices.",
    phrases: mk("cir", [
      {
        english: "Please read the circular sent home yesterday.",
        telugu: "నిన్న ఇంటికి పంపిన సర్క్యులర్‌ను చదవండి.",
        hindi: "कृपया कल घर भेजा गया परिपत्र पढ़ें।",
        usage: "Ask parents to look at a document.",
      },
      {
        english: "A copy of the circular is on the notice board.",
        telugu: "సర్క్యులర్ కాపీ నోటీసు బోర్డులో ఉంది.",
        hindi: "परिपत्र की एक प्रति सूचना पट पर है।",
        usage: "Point to the location.",
      },
    ]),
  },
  {
    id: "staff",
    name: "Staff Communication",
    emoji: "🧑‍🤝‍🧑",
    description: "Coordinate with colleagues clearly.",
    phrases: mk("stf", [
      {
        english: "Can we meet briefly after the second period?",
        telugu: "రెండవ పీరియడ్ తర్వాత కొద్దిసేపు కలుద్దామా?",
        hindi: "क्या हम दूसरे पीरियड के बाद थोड़ी देर मिल सकते हैं?",
        usage: "Set up a quick catch-up.",
      },
      {
        english: "Please share the report with me by evening.",
        telugu: "సాయంత్రం లోగా నివేదికను నాతో పంచుకోండి.",
        hindi: "कृपया शाम तक रिपोर्ट मुझे भेज दें।",
        usage: "Set a soft deadline.",
      },
      {
        english: "Thank you for handling that so well.",
        telugu: "అది చాలా బాగా నిర్వహించినందుకు ధన్యవాదాలు.",
        hindi: "इसे इतनी अच्छी तरह संभालने के लिए धन्यवाद।",
        usage: "Acknowledge good work.",
      },
    ]),
  },
];
