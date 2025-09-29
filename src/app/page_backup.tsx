export default function Home() {
  return (
    <section className="mx-auto max-w-3xl text-center py-16 space-y-6">
      <h1 className="text-4xl md:text-5xl font-semibold">Art-first. Street-approved.</h1>
      <p className="text-gray-600">
        Premium digital art with complimentary gifts. I-71 compliant • 21+ • DC delivery.
      </p>
      <div className="flex justify-center gap-3">
        <a href="/shop" className="px-5 py-3 rounded-xl bg-black text-white">Shop Now</a>
        <a href="/how-it-works" className="px-5 py-3 rounded-xl border">How It Works</a>
      </div>
    </section>
  );
}
