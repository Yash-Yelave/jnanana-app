import type { Metadata } from "next";
import { ProfileView } from "@/components/student-pages";
export const metadata: Metadata = { title: "Mentor profile" };
export default function MentorPage(){ return <ProfileView mentorDetail/>; }
