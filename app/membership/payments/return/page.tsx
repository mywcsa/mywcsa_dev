import Link from "next/link";
import s from "../../portal.module.css";
export default function PaymentReturn() {
  return <div className={`${s.portal} ${s.paymentPage}`}><main className={s.main} style={{ maxWidth: 680, margin: "40px auto" }}><p className={s.eyebrow}>MYWCSA MEMBERSHIP</p><h1>Payment confirmation</h1><section className={s.panel}><h2>Registry is checking your payment</h2><p>Returning from checkout does not confirm payment. Paystack’s verified notification is recorded by MyWCSA AMS; Registry will issue your receipt and update membership status.</p><p>If checkout reported success, keep your Paystack reference and do not pay again while confirmation is pending. Contact Registry if you need assistance.</p></section><Link href="/membership/membership">Return to membership</Link></main></div>;
}
