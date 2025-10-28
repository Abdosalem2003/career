import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import "./components/admin/quill-editor/quill-custom.css";

createRoot(document.getElementById("root")!).render(<App />);
