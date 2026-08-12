import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Sparkles, BookOpen, Presentation, Users2, Phone, LineChart } from "lucide-react";
import { PageContainer } from "@/components/common/PageContainer";
import { PageHeader } from "@/components/common/PageHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DailyWordSection } from "@/components/learning/sections/DailyWordSection";
import { VocabularyBuilderSection } from "@/components/learning/sections/VocabularyBuilderSection";
import { ClassroomSection } from "@/components/learning/sections/ClassroomSection";
import { ParentMeetingsSection } from "@/components/learning/sections/ParentMeetingsSection";
import { OfficeSection } from "@/components/learning/sections/OfficeSection";
import { LearningProgressSection } from "@/components/learning/sections/LearningProgressSection";

export const Route = createFileRoute("/_authenticated/vocabulary")({
  head: () => ({
    meta: [
      { title: "English Learning Center · SVS English Coach" },
      {
        name: "description",
        content:
          "Daily word, vocabulary builder, classroom, parent meeting and office English — all in one learning center.",
      },
      { property: "og:title", content: "English Learning Center · SVS English Coach" },
      {
        property: "og:description",
        content:
          "Structured English learning for Sri Vijaya Sai High School staff — vocabulary, classroom, parent, and office scenarios.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: VocabularyPage,
});

const TABS = [
  { id: "daily-word", label: "Daily Word", icon: Sparkles },
  { id: "vocabulary", label: "Vocabulary", icon: BookOpen },
  { id: "classroom", label: "Classroom", icon: Presentation },
  { id: "parents", label: "Parents", icon: Users2 },
  { id: "office", label: "Office", icon: Phone },
  { id: "progress", label: "Progress", icon: LineChart },
] as const;

function VocabularyPage() {
  const [tab, setTab] = useState<string>("daily-word");

  return (
    <PageContainer>
      <PageHeader
        title="English Learning Center"
        description="Everything in one place — daily word, vocabulary, classroom, parent meetings, office English, and your progress."
      />

      <Tabs value={tab} onValueChange={setTab}>
        <div className="-mx-1 mb-6 overflow-x-auto px-1 pb-1">
          <TabsList className="w-max">
            {TABS.map(({ id, label, icon: Icon }) => (
              <TabsTrigger key={id} value={id} className="gap-1.5">
                <Icon className="h-4 w-4" />
                {label}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        <TabsContent value="daily-word">
          <DailyWordSection />
        </TabsContent>
        <TabsContent value="vocabulary">
          <VocabularyBuilderSection />
        </TabsContent>
        <TabsContent value="classroom">
          <ClassroomSection />
        </TabsContent>
        <TabsContent value="parents">
          <ParentMeetingsSection />
        </TabsContent>
        <TabsContent value="office">
          <OfficeSection />
        </TabsContent>
        <TabsContent value="progress">
          <LearningProgressSection />
        </TabsContent>
      </Tabs>
    </PageContainer>
  );
}
