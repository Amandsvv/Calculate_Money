import React from "react";
import { Link } from "react-router-dom";
import { Users, Wallet, Calendar, BarChart } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50 flex flex-col">
      {/* Hero Section */}
      <header className="px-6 py-10 md:py-20 text-center max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 mb-6">
          RoomieSplit
        </h1>
        <p className="text-lg md:text-xl text-gray-600 mb-8">
          Share expenses with friends, track who paid what, and split bills
          fairly — all in one place.
        </p>
        <div className="flex justify-center gap-4">
          <Link
            to="/signup"
            className="px-6 py-3 rounded-2xl bg-indigo-600 text-white font-semibold shadow hover:bg-indigo-700 transition"
          >
            Get Started
          </Link>
          <Link
            to="/login"
            className="px-6 py-3 rounded-2xl bg-gray-100 text-gray-800 font-semibold shadow hover:bg-gray-200 transition"
          >
            Login
          </Link>
        </div>
      </header>

      {/* Features */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-4 gap-8 text-center">
          <div className="p-6 rounded-xl bg-indigo-50 shadow hover:shadow-lg transition">
            <Users className="mx-auto h-10 w-10 text-indigo-600 mb-4" />
            <h3 className="font-bold text-lg mb-2">Create Groups</h3>
            <p className="text-gray-600 text-sm">
              Easily make groups for trips, roommates, or events.
            </p>
          </div>
          <div className="p-6 rounded-xl bg-indigo-50 shadow hover:shadow-lg transition">
            <Wallet className="mx-auto h-10 w-10 text-indigo-600 mb-4" />
            <h3 className="font-bold text-lg mb-2">Track Expenses</h3>
            <p className="text-gray-600 text-sm">
              Log who paid, when, and what for — stay transparent.
            </p>
          </div>
          <div className="p-6 rounded-xl bg-indigo-50 shadow hover:shadow-lg transition">
            <Calendar className="mx-auto h-10 w-10 text-indigo-600 mb-4" />
            <h3 className="font-bold text-lg mb-2">Monthly Reports</h3>
            <p className="text-gray-600 text-sm">
              Get detailed month-by-month breakdowns.
            </p>
          </div>
          <div className="p-6 rounded-xl bg-indigo-50 shadow hover:shadow-lg transition">
            <BarChart className="mx-auto h-10 w-10 text-indigo-600 mb-4" />
            <h3 className="font-bold text-lg mb-2">Fair Split</h3>
            <p className="text-gray-600 text-sm">
              Automatically calculate how much each person owes.
            </p>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-20 bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-10">
            How It Works
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-6 bg-white/10 rounded-xl shadow-md">
              <h3 className="font-semibold text-lg mb-2">1. Create Group</h3>
              <p className="text-sm">
                Make a group for your trip, event, or roommates.
              </p>
            </div>
            <div className="p-6 bg-white/10 rounded-xl shadow-md">
              <h3 className="font-semibold text-lg mb-2">2. Add Expenses</h3>
              <p className="text-sm">
                Log every payment — who paid, when, and for what.
              </p>
            </div>
            <div className="p-6 bg-white/10 rounded-xl shadow-md">
              <h3 className="font-semibold text-lg mb-2">3. Split & Settle</h3>
              <p className="text-sm">
                Instantly calculate fair shares and settle easily.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <footer className="py-16 text-center">
        <h2 className="text-2xl md:text-3xl font-bold mb-6">
          Ready to simplify expense sharing?
        </h2>
        <Link
          to="/signup"
          className="px-8 py-4 rounded-2xl bg-indigo-600 text-white font-semibold shadow-lg hover:bg-indigo-700 transition"
        >
          Join RoomieSplit Now 🚀
        </Link>
        <p className="mt-6 text-sm text-gray-500">© 2025 RoomieSplit</p>
      </footer>
    </div>
  );
}
