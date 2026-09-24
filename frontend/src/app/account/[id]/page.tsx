import { ProjectDetail } from "@/components/account/project-detail";

export default async function ProjectDetailPage({
  params,
}: PageProps<"/account/[id]">) {
  const { id } = await params;
  return <ProjectDetail estimateId={id} />;
}
