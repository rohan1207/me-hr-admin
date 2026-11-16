import InsightEditor from "@/components/insights/InsightEditor";

export default async function EditInsightPage({ params }) {
  const { id } = await params;
  return <InsightEditor id={id} />;
}
