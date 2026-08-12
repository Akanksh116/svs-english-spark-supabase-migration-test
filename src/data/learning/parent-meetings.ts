export interface ConversationExample {
  id: string;
  scenario: string;
  english: string;
  telugu: string;
  hindi: string;
  keyVocab: string[];
  tips: string[];
}

export interface ParentTopic {
  id: string;
  name: string;
  emoji: string;
  description: string;
  examples: ConversationExample[];
}

export const PARENT_TOPICS: ParentTopic[] = [
  {
    id: "greeting",
    name: "Greeting Parents",
    emoji: "👋",
    description: "Warm, respectful openings that set the tone.",
    examples: [
      {
        id: "greet-1",
        scenario: "Meeting a parent for the first time.",
        english: "Namaste, I am Mrs. Rao — Ravi's class teacher. Thank you for coming in today.",
        telugu: "నమస్తే, నేను శ్రీమతి రావు — రవి తరగతి ఉపాధ్యాయిని. ఇవాళ వచ్చినందుకు ధన్యవాదాలు.",
        hindi: "नमस्ते, मैं श्रीमती राव हूँ — रवि की कक्षा शिक्षिका। आज आने के लिए धन्यवाद।",
        keyVocab: ["class teacher", "welcome", "appreciate"],
        tips: ["Smile and use the parent's family name.", "Offer them a seat before starting."],
      },
    ],
  },
  {
    id: "marks",
    name: "Discussing Marks",
    emoji: "📊",
    description: "Talk about performance clearly and kindly.",
    examples: [
      {
        id: "marks-1",
        scenario: "Sharing an improvement.",
        english:
          "Ravi has scored 78 in maths this term — that's a 10-mark improvement. Great effort.",
        telugu:
          "రవి ఈ టర్మ్‌లో మ్యాథ్స్‌లో 78 మార్కులు సాధించాడు — ఇది 10 మార్కుల మెరుగుదల. చాలా మంచి కృషి.",
        hindi:
          "रवि ने इस टर्म में गणित में 78 अंक प्राप्त किए — यह 10 अंकों का सुधार है। बहुत अच्छा प्रयास है।",
        keyVocab: ["score", "improvement", "effort"],
        tips: [
          "Lead with the positive change before any concern.",
          "Use exact numbers when you can.",
        ],
      },
      {
        id: "marks-2",
        scenario: "Sharing a lower score honestly.",
        english:
          "His English marks dropped a little this time. Let's work together on reading practice.",
        telugu:
          "ఈసారి అతని ఇంగ్లీష్ మార్కులు కొద్దిగా తగ్గాయి. కలిసి రీడింగ్ ప్రాక్టీస్‌పై పని చేద్దాం.",
        hindi: "इस बार उसके अंग्रेज़ी के अंक थोड़े कम आए हैं। आइए हम रीडिंग पर मिलकर काम करें।",
        keyVocab: ["dropped", "practice", "together"],
        tips: ["Frame it as a partnership.", "Suggest one clear action they can take at home."],
      },
    ],
  },
  {
    id: "attendance",
    name: "Attendance",
    emoji: "📅",
    description: "Discuss attendance patterns with care.",
    examples: [
      {
        id: "att-1",
        scenario: "Following up on frequent absences.",
        english: "I noticed Sita has missed five days this month. Is everything okay at home?",
        telugu: "సీత ఈ నెల ఐదు రోజులు గైర్హాజరైంది. ఇంట్లో అంతా బాగానే ఉందా?",
        hindi: "मैंने देखा कि सीता इस महीने पाँच दिन अनुपस्थित रही। क्या घर पर सब ठीक है?",
        keyVocab: ["absent", "missed", "concern"],
        tips: ["Ask, don't assume.", "Show concern for the family, not just the record."],
      },
    ],
  },
  {
    id: "homework",
    name: "Homework",
    emoji: "🏠",
    description: "Discuss homework habits without blame.",
    examples: [
      {
        id: "hw-1",
        scenario: "Homework is often incomplete.",
        english:
          "Ravi is bright, but his homework is often incomplete. A fixed study time at home would help a lot.",
        telugu:
          "రవి తెలివైనవాడు, కానీ అతని గృహకార్యం తరచుగా పూర్తికాదు. ఇంట్లో ఒక నిర్దిష్ట అధ్యయన సమయం చాలా సహాయపడుతుంది.",
        hindi:
          "रवि होशियार है, पर उसका गृहकार्य अक्सर अधूरा रहता है। घर पर एक निश्चित पढ़ाई का समय बहुत मदद करेगा।",
        keyVocab: ["incomplete", "study time", "routine"],
        tips: ["Praise a strength first.", "End with one concrete suggestion."],
      },
    ],
  },
  {
    id: "behavior",
    name: "Behavior",
    emoji: "🧭",
    description: "Discuss behavior with respect.",
    examples: [
      {
        id: "beh-1",
        scenario: "A small behavior concern.",
        english:
          "In class, Ravi sometimes talks during the lesson. He listens well when I remind him, so it's a small habit we can fix.",
        telugu:
          "తరగతిలో రవి కొన్నిసార్లు పాఠం సమయంలో మాట్లాడతాడు. నేను గుర్తు చేసినప్పుడు బాగా వింటాడు, కాబట్టి ఇది సరిచేయగల చిన్న అలవాటు.",
        hindi:
          "कक्षा में रवि कभी-कभी पाठ के दौरान बात करता है। जब मैं याद दिलाती हूँ तो वह अच्छे से सुनता है, इसलिए यह एक छोटी आदत है जिसे सुधारा जा सकता है।",
        keyVocab: ["habit", "remind", "listen"],
        tips: ["Describe behavior, not character.", "Show that improvement is possible."],
      },
    ],
  },
  {
    id: "suggestions",
    name: "Suggestions",
    emoji: "💡",
    description: "Offer practical ideas for home support.",
    examples: [
      {
        id: "sug-1",
        scenario: "Suggesting reading time at home.",
        english:
          "May I suggest 15 minutes of reading aloud every evening? It will really help her English.",
        telugu:
          "ప్రతి సాయంత్రం 15 నిమిషాలు బిగ్గరగా చదవడం సూచించవచ్చా? ఇది ఆమె ఇంగ్లీష్‌కు నిజంగా సహాయపడుతుంది.",
        hindi:
          "क्या मैं हर शाम 15 मिनट ज़ोर से पढ़ने का सुझाव दे सकती हूँ? इससे उसकी अंग्रेज़ी में बहुत मदद मिलेगी।",
        keyVocab: ["suggest", "reading aloud", "practice"],
        tips: ["Keep the ask small and specific.", "Explain the benefit clearly."],
      },
    ],
  },
  {
    id: "encouragement",
    name: "Encouragement",
    emoji: "🌟",
    description: "Close on a warm, encouraging note.",
    examples: [
      {
        id: "enc-1",
        scenario: "Wrapping up the meeting.",
        english:
          "Thank you for your time. With your support at home, I'm sure she will do very well this year.",
        telugu:
          "మీ సమయానికి ధన్యవాదాలు. ఇంట్లో మీ మద్దతుతో, ఆమె ఈ సంవత్సరం చాలా బాగా చేస్తుందని నాకు నమ్మకం.",
        hindi:
          "आपके समय के लिए धन्यवाद। घर पर आपके सहयोग से मुझे यक़ीन है कि वह इस साल बहुत अच्छा करेगी।",
        keyVocab: ["support", "confident", "thank you"],
        tips: ["Thank the parent sincerely.", "End with an optimistic sentence."],
      },
    ],
  },
];
