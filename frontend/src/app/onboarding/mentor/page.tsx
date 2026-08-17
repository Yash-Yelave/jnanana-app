import type { Metadata } from "next";
import { OnboardingFlow } from "@/components/onboarding-flow";

export const metadata: Metadata = { title: "Mentor onboarding" };
export default function MentorOnboardingPage() { return <OnboardingFlow role="mentor" />; }
