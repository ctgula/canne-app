"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase";

export default function DriversPage() {
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setStatus("idle");

    const form = new FormData(e.currentTarget);
    const availability = form.getAll("availability") as string[];
    
    // Validate that at least one availability option is selected
    if (availability.length === 0) {
      setLoading(false);
      setStatus("error");
      return;
    }

    const payload = {
      full_name: form.get("full_name") as string,
      phone: form.get("phone") as string,
      email: form.get("email") as string,
      availability: availability,
      experience: form.get("experience") as string || null,
    };

    try {
      const { error } = await supabase.from("drivers").insert([payload]);
      
      if (error) {
        console.error("Driver application error:", error);
        setStatus("error");
      } else {
        setStatus("success");
        (e.target as HTMLFormElement).reset();
      }
    } catch (err) {
      console.error("Unexpected error:", err);
      setStatus("error");
    }
    
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-white">
      <main className="mx-auto max-w-2xl px-6 py-12 space-y-12">
        {/* Hero Section */}
        <header className="text-center space-y-6">
          <div className="flex items-center justify-center gap-3 mb-4">
            <span className="text-4xl">🍦</span>
            <h1 className="text-4xl font-bold text-black">Cannè</h1>
          </div>
          <h2 className="text-3xl font-bold text-black leading-tight">
            🚴 Join the Cannè Delivery Team — DC Only 🚴‍♂️
          </h2>
          
          {/* Benefits List */}
          <div className="bg-gray-50 rounded-lg p-6 mt-8">
            <ul className="text-left list-disc list-inside text-gray-800 space-y-3 text-lg">
              <li><strong>Earn $20–$30/hr</strong> active time</li>
              <li>Paid per order: <strong className="text-green-600">$8 first stop, +$4 each extra stop</strong></li>
              <li><strong>Keep 100% of your tips</strong></li>
              <li>No restaurant waits — only quick, discrete drop-offs inside DC</li>
              <li>Flexible shifts (lunch, dinner, late-night)</li>
              <li>Fast onboarding process</li>
            </ul>
          </div>
        </header>

        {/* Call to Action */}
        <section className="text-center">
          <h3 className="text-2xl font-semibold text-black mb-8">
            Fill out the form below to apply.
          </h3>

          {/* Application Form */}
          <form onSubmit={handleSubmit} className="space-y-6 text-left">
            <div>
              <input
                required
                name="full_name"
                type="text"
                placeholder="First & LAST Name"
                className="w-full rounded-lg border-2 border-gray-300 px-4 py-3 text-lg focus:border-green-500 focus:outline-none transition-colors"
              />
            </div>

            <div>
              <input
                required
                type="tel"
                name="phone"
                placeholder="Phone Number"
                className="w-full rounded-lg border-2 border-gray-300 px-4 py-3 text-lg focus:border-green-500 focus:outline-none transition-colors"
              />
            </div>

            <div>
              <input
                required
                type="email"
                name="email"
                placeholder="Email"
                className="w-full rounded-lg border-2 border-gray-300 px-4 py-3 text-lg focus:border-green-500 focus:outline-none transition-colors"
              />
            </div>

            <fieldset className="space-y-3">
              <legend className="font-semibold text-lg text-black mb-3">
                Availability (select at least one) *
              </legend>
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="availability"
                  value="Lunch"
                  className="w-5 h-5 text-green-600 border-2 border-gray-300 rounded focus:ring-green-500"
                />
                <span className="text-lg">Lunch (11am - 3pm)</span>
              </label>
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="availability"
                  value="Dinner"
                  className="w-5 h-5 text-green-600 border-2 border-gray-300 rounded focus:ring-green-500"
                />
                <span className="text-lg">Dinner (5pm - 10pm)</span>
              </label>
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="availability"
                  value="Late-night"
                  className="w-5 h-5 text-green-600 border-2 border-gray-300 rounded focus:ring-green-500"
                />
                <span className="text-lg">Late-night (10pm - 2am)</span>
              </label>
            </fieldset>

            <div>
              <textarea
                name="experience"
                placeholder="Tell us about your delivery experience, vehicle type, and why you'd be great for this role (optional)"
                rows={4}
                className="w-full rounded-lg border-2 border-gray-300 px-4 py-3 text-lg focus:border-green-500 focus:outline-none transition-colors resize-vertical"
              />
            </div>

            <button
              disabled={loading}
              type="submit"
              className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white py-4 rounded-lg font-semibold text-lg transition-colors"
            >
              {loading ? "Submitting..." : "Submit Application"}
            </button>
          </form>

          {/* Status Messages */}
          {status === "success" && (
            <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-800 text-lg font-medium">
                ✅ Thanks! We'll be in touch shortly.
              </p>
            </div>
          )}
          
          {status === "error" && (
            <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800 text-lg font-medium">
                ❌ Something went wrong. Please make sure all required fields are filled out and try again.
              </p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
