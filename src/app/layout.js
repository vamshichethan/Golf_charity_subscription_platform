import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata = {
  title: "Swing For Good | Golf Charity Platform",
  description: "Track your golf scores, participate in monthly draws, and support your favorite charities with every swing.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable}`}>
      <body>
        <div className="app-container">
          <header className="navbar">
            <div className="nav-brand">SwingForGood</div>
            <nav className="nav-links">
              <a href="/">Home</a>
              <a href="/charities">Charities</a>
              <a href="/dashboard">Dashboard</a>
              <a href="/login" className="btn-primary">Sign In</a>
            </nav>
          </header>
          <main className="main-content">
            {children}
          </main>
          <footer className="footer">
            <p>&copy; {new Date().getFullYear()} SwingForGood by Digital Heroes. Sample build.</p>
          </footer>
        </div>
      </body>
    </html>
  );
}
