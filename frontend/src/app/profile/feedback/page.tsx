import type { Metadata } from "next";
import { ProfileView } from "@/components/student-pages";
export const metadata: Metadata = { title: "Feedback" };
export default function ProfileFeedbackPage(){ return <ProfileView mode="feedback"/>; }
