import { SchedulePage } from "@/components/utility-pages";
export default async function BookLessonPage({ searchParams }: { searchParams: Promise<{ mentor?: string }> }) {
  const { mentor } = await searchParams;
  return <SchedulePage booking mentorId={mentor}/>;
}
