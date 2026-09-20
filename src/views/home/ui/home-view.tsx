import { getProfile } from "@/entities/profile/api/get-profile";
import { getPublishedProjects } from "@/entities/project/api/get-published-projects";
import { HomeScrollLayout } from "@/widgets/home-scroll-layout/ui/home-scroll-layout";

export async function HomeView() {
  const [profile, projects] = await Promise.all([getProfile(), getPublishedProjects()]);

  if (!profile) return null;

  return <HomeScrollLayout profile={profile} projects={projects} />;
}
