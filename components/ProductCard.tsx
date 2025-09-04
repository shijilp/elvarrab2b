import Image from "next/image";

type Product = {
  id: number;
  name: string;
  price: string;
  image: string;
  tag?: string;
};

export default function ProductCard({ product }: { product: Product }) {
  return (
    <div className="group rounded-2xl p-2 transition-transform hover:-translate-y-0.5 ring-1 ring-neutral-200 dark:ring-neutral-800 bg-white/90 dark:bg-neutral-900/70">
      <div className="relative">
        <Image
          src={product.image}
          alt={product.name}
          width={900}
          height={1000}
          sizes="(min-width: 1024px) 600px, 100vw"
          className="aspect-[4/5] w-full rounded-xl object-cover"
        />
        {product.tag && (
          <span
            className="absolute left-2 top-2 rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-wider"
            style={{ background: "var(--chip-bg)", color: "var(--chip-fg)" }}
          >
            {product.tag}
          </span>
        )}
      </div>
      <div className="p-2">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium">{product.name}</h3>
          <span className="text-sm opacity-80">{}</span>
        </div>
        {/* <button className="mt-3 w-full rounded-xl px-3 py-2 text-sm text-neutral-900 dark:text-neutral-900 gradient-accent">
          Quick Add
        </button> */}
      </div>
    </div>
  );
}
