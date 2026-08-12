/**
 * Static content for dashboard widgets. Structured so it can be swapped for
 * database-driven content later without changing the widgets.
 */

export interface WordOfTheDay {
  word: string;
  pronunciation: string;
  meaningEnglish: string;
  meaningTelugu: string;
  meaningHindi: string;
  example: string;
}

export interface Motivation {
  quote: string;
  author?: string;
}

export interface JourneyLevel {
  key: "beginner" | "elementary" | "intermediate" | "advanced" | "master";
  title: string;
  description: string;
}

export const WORDS_OF_THE_DAY: WordOfTheDay[] = [
  {
    word: "Diligent",
    pronunciation: "/ˈdɪlɪdʒənt/",
    meaningEnglish: "Showing careful and persistent effort in work.",
    meaningTelugu: "శ్రద్ధగా, పట్టుదలతో పనిచేసే",
    meaningHindi: "मेहनती, लगनशील",
    example: "She is a diligent teacher who prepares every lesson with care.",
  },
  {
    word: "Encourage",
    pronunciation: "/ɪnˈkʌrɪdʒ/",
    meaningEnglish: "To give someone support, confidence, or hope.",
    meaningTelugu: "ప్రోత్సహించు",
    meaningHindi: "प्रोत्साहित करना",
    example: "Good teachers encourage students to ask questions.",
  },
  {
    word: "Punctual",
    pronunciation: "/ˈpʌŋktʃuəl/",
    meaningEnglish: "Happening or arriving at the expected time.",
    meaningTelugu: "సమయపాలన కలిగిన",
    meaningHindi: "समयनिष्ठ",
    example: "Please be punctual for the morning assembly.",
  },
  {
    word: "Respectful",
    pronunciation: "/rɪˈspektfəl/",
    meaningEnglish: "Feeling or showing deference and admiration.",
    meaningTelugu: "గౌరవంగా ఉండే",
    meaningHindi: "आदरपूर्ण",
    example: "Students should be respectful to every staff member.",
  },
  {
    word: "Curriculum",
    pronunciation: "/kəˈrɪkjələm/",
    meaningEnglish: "The subjects taught in a school or college.",
    meaningTelugu: "పాఠ్యప్రణాళిక",
    meaningHindi: "पाठ्यक्रम",
    example: "The new curriculum focuses on spoken English.",
  },
  {
    word: "Attentive",
    pronunciation: "/əˈtentɪv/",
    meaningEnglish: "Paying close attention to something.",
    meaningTelugu: "శ్రద్ధగా వినే",
    meaningHindi: "ध्यान देने वाला",
    example: "The class was attentive during the story.",
  },
  {
    word: "Confident",
    pronunciation: "/ˈkɒnfɪdənt/",
    meaningEnglish: "Feeling sure about your abilities.",
    meaningTelugu: "ఆత్మవిశ్వాసం కలిగిన",
    meaningHindi: "आत्मविश्वासी",
    example: "Speak confidently — small mistakes are fine.",
  },
];

export const MOTIVATIONS: Motivation[] = [
  { quote: "Small steps every day lead to big changes." },
  { quote: "Every conversation is a chance to grow." },
  { quote: "Confidence comes from consistent practice." },
  { quote: "Speak with courage — mistakes are part of learning." },
  { quote: "A little English every day keeps confidence in play." },
  { quote: "You don't have to be perfect to begin — just begin." },
  { quote: "Practice makes progress, not perfection." },
];

export const JOURNEY_LEVELS: JourneyLevel[] = [
  {
    key: "beginner",
    title: "Beginner",
    description: "Start with greetings and simple sentences.",
  },
  {
    key: "elementary",
    title: "Elementary",
    description: "Everyday classroom and office conversations.",
  },
  {
    key: "intermediate",
    title: "Intermediate",
    description: "Confidently handle parent meetings and calls.",
  },
  {
    key: "advanced",
    title: "Advanced",
    description: "Fluent public speaking and detailed explanations.",
  },
  {
    key: "master",
    title: "Master Teacher",
    description: "Guide and mentor others with ease.",
  },
];

/** Deterministic daily pick — same content for the whole day, rotates by date. */
export function pickForToday<T>(list: T[], date = new Date()): T | null {
  if (list.length === 0) return null;
  const day = Math.floor(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()) / 86400000,
  );
  return list[day % list.length];
}
