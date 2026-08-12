export interface Phrase {
  id: string;
  english: string;
  telugu: string;
  hindi: string;
  pronunciation: string;
  usage: string;
}

export interface PhraseGroup {
  id: string;
  name: string;
  emoji: string;
  description: string;
  phrases: Phrase[];
}

const mk = (group: string, list: Omit<Phrase, "id">[]): Phrase[] =>
  list.map((p, i) => ({ ...p, id: `${group}-${i}` }));

export const CLASSROOM_GROUPS: PhraseGroup[] = [
  {
    id: "start",
    name: "Starting Class",
    emoji: "🔔",
    description: "Openers to settle the class.",
    phrases: mk("start", [
      {
        english: "Good morning, class. Please sit down.",
        telugu: "శుభోదయం. దయచేసి కూర్చోండి.",
        hindi: "सुप्रभात कक्षा। कृपया बैठ जाइए।",
        pronunciation: "gud MOR-ning klas",
        usage: "Say this as students enter the room.",
      },
      {
        english: "Let's begin today's lesson.",
        telugu: "ఇవాళ్టి పాఠాన్ని ప్రారంభిద్దాం.",
        hindi: "आइए आज का पाठ शुरू करते हैं।",
        pronunciation: "lets bi-GIN tuh-DAYZ LES-uhn",
        usage: "To move from settling to teaching.",
      },
      {
        english: "Please take out your books.",
        telugu: "మీ పుస్తకాలను బయటకు తీయండి.",
        hindi: "कृपया अपनी किताबें निकालें।",
        pronunciation: "pleez tayk owt yor buks",
        usage: "Prompt students to prepare materials.",
      },
    ]),
  },
  {
    id: "attendance",
    name: "Attendance",
    emoji: "📋",
    description: "Take a clear, respectful roll call.",
    phrases: mk("att", [
      {
        english: "I will now take attendance.",
        telugu: "ఇప్పుడు హాజరు తీసుకుంటాను.",
        hindi: "अब मैं उपस्थिति लूँगा/लूँगी।",
        pronunciation: "I wil now tayk uh-TEN-duhns",
        usage: "Signal you are starting the register.",
      },
      {
        english: "Please say 'present' when I call your name.",
        telugu: "నేను మీ పేరు పిలిచినప్పుడు 'ప్రజెంట్' అని చెప్పండి.",
        hindi: "जब मैं आपका नाम पुकारूँ तो 'प्रेजेंट' कहें।",
        pronunciation: "sey PREZ-uhnt",
        usage: "Instruct students on responding.",
      },
      {
        english: "Is anyone absent today?",
        telugu: "ఇవాళ ఎవరైనా గైర్హాజరుగా ఉన్నారా?",
        hindi: "क्या आज कोई अनुपस्थित है?",
        pronunciation: "iz EN-ee-wun AB-suhnt tuh-DAY",
        usage: "Quick check after roll call.",
      },
    ]),
  },
  {
    id: "teaching",
    name: "Teaching",
    emoji: "📚",
    description: "Explaining lessons clearly.",
    phrases: mk("tch", [
      {
        english: "Let me explain this once more.",
        telugu: "నేను ఇది మరోసారి వివరిస్తాను.",
        hindi: "मैं इसे एक बार और समझाता/समझाती हूँ।",
        pronunciation: "let mee ik-SPLAYN this wuns mor",
        usage: "Repeat a difficult idea.",
      },
      {
        english: "Look at the board, please.",
        telugu: "బోర్డు వైపు చూడండి.",
        hindi: "कृपया बोर्ड की ओर देखें।",
        pronunciation: "luk at the bord pleez",
        usage: "Direct attention to the board.",
      },
      {
        english: "This is an important point.",
        telugu: "ఇది ముఖ్యమైన అంశం.",
        hindi: "यह एक महत्वपूर्ण बात है।",
        pronunciation: "this iz an im-POR-tuhnt point",
        usage: "Emphasize key content.",
      },
    ]),
  },
  {
    id: "questioning",
    name: "Questioning",
    emoji: "❓",
    description: "Invite thinking and responses.",
    phrases: mk("q", [
      {
        english: "Can anyone answer this?",
        telugu: "ఎవరైనా దీనికి సమాధానం చెప్పగలరా?",
        hindi: "क्या कोई इसका उत्तर दे सकता है?",
        pronunciation: "kan EN-ee-wun AN-ser this",
        usage: "Open a question to the whole class.",
      },
      {
        english: "What do you think, Ravi?",
        telugu: "నీవు ఏమనుకుంటున్నావు, రవి?",
        hindi: "आप क्या सोचते हैं, रवि?",
        pronunciation: "wut doo yoo thingk",
        usage: "Invite one student personally.",
      },
      {
        english: "Try again — you're close.",
        telugu: "మళ్లీ ప్రయత్నించు — దగ్గరగా ఉన్నావు.",
        hindi: "फिर से कोशिश करो — तुम बहुत करीब हो।",
        pronunciation: "try uh-GEN yor klohs",
        usage: "Encourage after a near-correct answer.",
      },
    ]),
  },
  {
    id: "homework",
    name: "Homework",
    emoji: "🏠",
    description: "Assign and review homework.",
    phrases: mk("hw", [
      {
        english: "Your homework for today is on page 42.",
        telugu: "ఇవాళ మీ గృహకార్యం 42వ పేజీలో ఉంది.",
        hindi: "आज आपका गृहकार्य पृष्ठ 42 पर है।",
        pronunciation: "yor HOHM-wurk fer tuh-DAY",
        usage: "Assign the task clearly.",
      },
      {
        english: "Please complete it by tomorrow.",
        telugu: "దయచేసి రేపటిలోగా పూర్తి చేయండి.",
        hindi: "कृपया इसे कल तक पूरा करें।",
        pronunciation: "pleez kuhm-PLEET it by tuh-MOR-oh",
        usage: "State the deadline.",
      },
      {
        english: "Show me your notebook, please.",
        telugu: "మీ నోట్‌బుక్‌ చూపించండి.",
        hindi: "कृपया अपनी कॉपी दिखाएँ।",
        pronunciation: "shoh mee yor NOHT-buk",
        usage: "Check completed work.",
      },
    ]),
  },
  {
    id: "discipline",
    name: "Discipline",
    emoji: "🧭",
    description: "Firm but respectful correction.",
    phrases: mk("dsc", [
      {
        english: "Please don't talk during the lesson.",
        telugu: "పాఠం సమయంలో మాట్లాడకండి.",
        hindi: "कृपया पाठ के दौरान बात न करें।",
        pronunciation: "pleez dohnt tawk DUR-ing thuh LES-uhn",
        usage: "Address quiet chatter.",
      },
      {
        english: "Sit properly, please.",
        telugu: "సరిగ్గా కూర్చోండి.",
        hindi: "कृपया सीधे बैठें।",
        pronunciation: "sit PROP-er-lee",
        usage: "Reset posture and focus.",
      },
      {
        english: "This is your last warning.",
        telugu: "ఇది మీ చివరి హెచ్చరిక.",
        hindi: "यह आपकी आख़िरी चेतावनी है।",
        pronunciation: "this iz yor last WOR-ning",
        usage: "Use sparingly for repeated behavior.",
      },
    ]),
  },
  {
    id: "encouragement",
    name: "Encouragement",
    emoji: "🌟",
    description: "Warm praise that motivates.",
    phrases: mk("enc", [
      {
        english: "Excellent work — well done!",
        telugu: "అద్భుతం — బాగా చేశావు!",
        hindi: "बहुत बढ़िया — शाबाश!",
        pronunciation: "EK-suh-luhnt wurk",
        usage: "Praise a strong answer or effort.",
      },
      {
        english: "I'm proud of your progress.",
        telugu: "మీ పురోగతిపై గర్వంగా ఉంది.",
        hindi: "मुझे आपकी प्रगति पर गर्व है।",
        pronunciation: "aim prowd uv yor PROG-res",
        usage: "Recognize consistent growth.",
      },
      {
        english: "Keep it up — you're improving.",
        telugu: "కొనసాగించు — నీవు మెరుగవుతున్నావు.",
        hindi: "जारी रखो — तुम सुधार कर रहे हो।",
        pronunciation: "keep it up",
        usage: "Motivate mid-lesson.",
      },
    ]),
  },
  {
    id: "ending",
    name: "Ending Class",
    emoji: "🕒",
    description: "Wrap up neatly and warmly.",
    phrases: mk("end", [
      {
        english: "Let's stop here for today.",
        telugu: "ఇవాళ్టికి ఇక్కడితో ఆపుదాం.",
        hindi: "आज के लिए यहीं रुकते हैं।",
        pronunciation: "lets stop heer fer tuh-DAY",
        usage: "Signal the end of class.",
      },
      {
        english: "Please revise this at home.",
        telugu: "దయచేసి ఇంట్లో దీన్ని పునఃసమీక్షించండి.",
        hindi: "कृपया इसे घर पर दोहराएँ।",
        pronunciation: "pleez ri-VYZ this at hohm",
        usage: "Set an expectation for the next class.",
      },
      {
        english: "Have a good day, everyone.",
        telugu: "అందరికీ శుభ దినం.",
        hindi: "आप सभी का दिन शुभ हो।",
        pronunciation: "hav uh gud day",
        usage: "Warm closing greeting.",
      },
    ]),
  },
];
