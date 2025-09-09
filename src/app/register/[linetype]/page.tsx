import RegisterForm from "@/app/components/registerform";

export default function RegisterPage({ params }: { params: { linetype: string } }) {
  const { linetype } = params;

  return <RegisterForm />
}