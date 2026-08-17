import type { Metadata } from "next";
import { ProfileView } from "@/components/student-pages";
export const metadata: Metadata = { title: "My lessons" };
export default function ProfileLessonsPage(){ return <ProfileView mode="lessons"/>; }
