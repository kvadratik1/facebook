import type { Metadata } from "next";
import "./globals.css";
import AuthSessionProvider from "./components/SessionProvider";
import NavBar from "./components/NavBar";

export const metadata: Metadata = {
  title: {
    default: "Posts",
    template: "%s · Posts",
  },
  description: "A simple shared space for posts.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <AuthSessionProvider>
          <NavBar />
          {children}
        </AuthSessionProvider>
      </body>
    </html>
  );
}
