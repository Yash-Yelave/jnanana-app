import type { Metadata } from "next";
import { OnboardingFlow } from "@/components/onboarding-flow";

export const metadata: Metadata = { title: "Student onboarding" };
export default function StudentOnboardingPage() { return <OnboardingFlow role="student" />; }
