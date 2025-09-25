export default function Footer() {
  return (
    <footer className="border-t border-neutral-800 py-8 mt-10 print:hidden">
      <div className="inset-0 -z-10 opacity-40 blur-3xl">
        <div className="pointer-events-none absolute -inset-5 rounded-[100px] gradient-accent" />
      </div>
      <div className="container text-sm text-neutral-600 dark:text-neutral-300 flex flex-col sm:flex-row justify-between gap-4">
        <p>© {new Date().getFullYear()} Elvarra. All rights reserved.</p>
        <nav className="flex gap-4">
          <a href="#">Privacy</a>
          <a href="#">Terms</a>
          <a href="/contact">Support</a>
        </nav>
      </div>
    </footer>
  );
}
