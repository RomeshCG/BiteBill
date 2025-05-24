import React from "react";
import Image from "next/image";

const features = [
	{
		icon: "globe.svg",
		title: "Create or Join Teams",
		description:
			"Easily create teams for your lunch buddies or join existing ones with a simple invitation.",
	},
	{
		icon: "calculator.svg",
		title: "Auto-Split Calculations",
		description:
			"Input meal costs and let BiteBill handle the math for splitting expenses fairly.",
	},
	{
		icon: "window.svg",
		title: "Mobile-first Design",
		description:
			"Optimized for use on your phone, right when you need it at the table.",
	},
	{
		icon: "cloud.svg",
		title: "Cloud Synced",
		description:
			"Your data syncs across all devices so you always have your expense history available.",
	},
];

export default function FeaturesSection() {
	return (
		<section className="py-16">
			<h2 className="text-3xl font-bold text-center mb-12 text-[#a78bfa] dark:text-[#a78bfa]">
				Split bills with ease
			</h2>
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
				{features.map((feature, idx) => (
					<div
						key={idx}
						className="bg-[#181825] dark:bg-[#232336] rounded-2xl shadow-lg p-8 flex flex-col items-center transition-colors border border-[#232336]/60 dark:border-[#232336]/80"
					>
						<div className="flex items-center justify-center w-14 h-14 rounded-full bg-[#a78bfa]/20 mb-4">
							<Image
								src={`/${feature.icon}`}
								alt={feature.title}
								width={32}
								height={32}
								className="text-white"
							/>
						</div>
						<h3 className="text-lg font-bold mb-2 text-white text-center">
							{feature.title}
						</h3>
						<p className="text-gray-300 text-center text-sm">
							{feature.description}
						</p>
					</div>
				))}
			</div>
		</section>
	);
}
