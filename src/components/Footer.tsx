import React from "react";

export default function Footer() {
  return (
    <footer className="w-full py-6 border-t border-border text-center text-muted-foreground text-sm mt-8">
      <div className="container mx-auto flex flex-col md:flex-row justify-between items-center gap-4 px-4">
        <span>© {new Date().getFullYear()} BiteBill. All rights reserved.</span>
        <div className="flex gap-4">
          <a href="#" className="hover:underline">About</a>
          <a href="#" className="hover:underline">Privacy</a>
          <a href="#" className="hover:underline">Contact</a>
        </div>
      </div>
    </footer>
  );
}
