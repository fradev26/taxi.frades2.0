import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Wrap the App in a root container with a scoping class so broad CSS overrides
// can be limited to the application instead of leaking to other contexts.
createRoot(document.getElementById("root")!).render(
	<div className="frades-luxury-root">
		<App />
	</div>
);
