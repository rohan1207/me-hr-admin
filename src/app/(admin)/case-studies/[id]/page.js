import CaseStudyEditor from "@/components/case-studies/CaseStudyEditor";

export default async function EditCaseStudyPage({ params }) {
  const { id } = await params;
  return <CaseStudyEditor id={id} />;
}
