import Link from "next/link";
import NewsletterForm from "./NewsletterForm"; // client component

export default function Footer() {
  return (
    <footer>
      {/* ...other columns... */}
      <div>
        <h3>Stay Connected</h3>
        <NewsletterForm /> {/* isolated client interactivity */}
      </div>
    </footer>
  );
}