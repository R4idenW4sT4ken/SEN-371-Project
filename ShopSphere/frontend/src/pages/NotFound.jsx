import { Link } from "react-router-dom";
import { Compass } from "lucide-react";
import { useDocumentTitle } from "../hooks/useDocumentTitle.js";
import EmptyState from "../components/EmptyState.jsx";

export default function NotFound() {
  useDocumentTitle("Page not found");

  return (
    <div className="main">
      <EmptyState
        icon={Compass}
        title="We couldn't find that page"
        copy="The page you're looking for doesn't exist or may have moved."
        action={<Link className="btn btn-primary" to="/">Back to the catalogue</Link>}
      />
    </div>
  );
}
