import React from "react";

const testimonials = [
	{
		quote: "BiteBill has eliminated the awkwardness of figuring out who owes what after team lunches.",
		name: "Sarah Chen",
		role: "Product Manager",
	},
	{
		quote: "The app is super intuitive and makes splitting bills with my coworkers incredibly simple.",
		name: "Marcus Johnson",
		role: "Software Developer",
	},
	{
		quote: "We use BiteBill for all our team outings. The auto-split feature is brilliant!",
		name: "Priya Sharma",
		role: "Team Lead",
	},
];

export default function TestimonialsSection() {
	return (
		<section className="py-16">
			<h2 className="text-3xl font-bold text-center mb-12 text-[#a78bfa] dark:text-[#a78bfa]">
				What teams are saying
			</h2>
			<div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
				{testimonials.map((t, idx) => (
					<div
						key={idx}
						className="bg-[#181825] dark:bg-[#232336] rounded-2xl shadow-lg p-8 border border-[#232336]/60 dark:border-[#232336]/80"
					>
						<blockquote className="italic text-white mb-4">“{t.quote}”</blockquote>
						<div className="text-sm text-gray-400">
							<div className="font-semibold text-white">{t.name}</div>
							<div>{t.role}</div>
						</div>
					</div>
				))}
			</div>
		</section>
	);
}
