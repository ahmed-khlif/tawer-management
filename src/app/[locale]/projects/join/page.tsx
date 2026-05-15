import { generateMeta } from "@/lib/utils";
import AcceptInvitationPageRender from "../../dashboard/(auth)/invitations/[token]/render";

interface Props {
  searchParams: Promise<{ token?: string }>;
}

export async function generateMetadata() {
  return generateMeta({
    title: "Accept invitation",
    description: "Accept a project invitation and join the team.",
    canonical: "/projects/join",
  });
}

export default async function Page({ searchParams }: Props) {
  const { token } = await searchParams;
  return <AcceptInvitationPageRender token={token ?? ""} />;
}
