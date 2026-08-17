import type { Metadata } from "next";
import { MentorDirectory } from "@/components/student-pages";
export const metadata: Metadata = { title: "Mentors" };
export default function MentorsPage(){ return <MentorDirectory/>; }
