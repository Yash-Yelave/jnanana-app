import type { Metadata } from "next";
import { ProfileView } from "@/components/student-pages";
export const metadata: Metadata = { title: "Mentor profile" };
export default async function MentorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ProfileView mentorDetail mentorId={id}/>;
}
