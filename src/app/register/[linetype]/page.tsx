"use client";
import RegisterForm from "../../components/registerform";

export default function RegisterPage({ params }: { params: { lineType: string } }) {
  // just pass params
  return <RegisterForm initialLineType={params.lineType} />;
}