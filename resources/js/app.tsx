import { createInertiaApp } from "@inertiajs/react";
import { createRoot } from "react-dom/client";
import "../css/app.css";

createInertiaApp({
    resolve: async name => {
        const pages = import.meta.glob("./pages/**/*.tsx", { eager: true });
        return (pages as Record<string, { default: React.ComponentType }>)[`./pages/${name}.tsx`];
    },
    setup({ el, App, props }) {
        createRoot(el).render(<App {...props} />);
    },
});
