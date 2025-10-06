"use client";
import Image from "next/image";
import React from "react";

const OccassionTab = () => {
  const items = [
    {
      key: "wedding",
      title: "Wedding",
      href: "/products?occasion=wedding", // requested path spelling preserved
      img: "https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=1200&auto=format&fit=crop",
      blurb: "Elegant pieces for the big day",
    },
    {
      key: "party",
      title: "Party",
      href: "/products?occasion=party",
      img: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?q=80&w=1200&auto=format&fit=crop",
      blurb: "Sparkle that owns the night",
    },
    {
      key: "office",
      title: "Office",
      href: "/products?occasion=office",
      img: "https://images.unsplash.com/photo-1518609571773-39b7d303a86b?q=80&w=1200&auto=format&fit=crop",
      blurb: "Polished & minimal for daily wear",
    },
    {
      key: "gifting",
      title: "Gifting",
      href: "/products?occasion=gifting",
      img: "https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=1200&auto=format&fit=crop",
      blurb: "Thoughtful sets & bestsellers",
    },
  ];
  return (
    <section className="container mx-auto py-12 lg:py-16">
      <div className="container">
        <header className="mb-4 flex items-end justify-between">
          <div>
            <h2 className="text-xl font-semibold">Choose by occasion</h2>
            <p className={`mt-1 text-sm $text-neutral-300`}>
              Find the perfect piece for every moment.
            </p>
          </div>
          {/* <Link
            href="/products"
            className={`hidden sm:inline-block rounded-xl px-3 py-1.5 text-sm el-btn`}
          >
            Shop all
          </Link> */}
        </header>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {items.map((it) => (
            <a
              key={it.key}
              href={it.href}
              className={`group relative overflow-hidden rounded-2xl ring-1 ring-neutral-800 bg-neutral-900/70`}
            >
              <Image
                width={400}
                height={500}
                src={it.img}
                alt={it.title}
                className="aspect-[4/5] w-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-x-0 bottom-0 p-3">
                <div className="rounded-xl bg-black/40 p-2 backdrop-blur">
                  <div className="text-sm font-medium text-white">
                    {it.title}
                  </div>
                  <div className="text-[11px] text-white/80">{it.blurb}</div>
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
};

export default OccassionTab;
