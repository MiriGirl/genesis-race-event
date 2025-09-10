import RegisterForm from "@/app/components/registerform";

export default async function RegisterPage({
  params,
}: {
  params: Promise<{ linetype: string }>;
}) {
  const { linetype } = await params;

  return <RegisterForm initialLineType={linetype} />;
}