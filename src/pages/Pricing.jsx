import React from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react'; // 'npm install lucide-react' করে নিন
import Navbar from '@/components/layout/Navbar';

const Pricing = () => {
    const plans = [
        {
            name: "Free",
            price: "0",
            desc: "Perfect for individuals trying out our platform.",
            features: ["5 Documents per month", "Standard Signing", "Email Support", "Secure Storage"],
            buttonText: "Get Started",
            highlight: false
        },
        {
            name: "Premium",
            price: "29",
            desc: "Best for professionals and small teams.",
            features: ["Unlimited Documents", "Custom Branding", "Priority Support", "Automated Workflows", "Team Collaboration"],
            buttonText: "Start Free Trial",
            highlight: true // এই কার্ডটি একটু বড় এবং হাইলাইটেড থাকবে
        },
        {
            name: "Enterprise",
            price: "99",
            desc: "Advanced security and control for large scales.",
            features: ["Bulk Sending", "API Access", "Dedicated Manager", "SAML SSO", "Advanced Analytics"],
            buttonText: "Contact Sales",
            highlight: false
        }
    ];

    return (
        <section className="bg-white py-24 px-6">

            <Navbar></Navbar>
            <div className="container mx-auto max-w-7xl">
                {/* Section Header */}
                <div className="text-center mb-16">
                    <h2 className="text-4xl font-extrabold text-[#0F172A] mb-4">
                        Simple, Transparent Pricing
                    </h2>
                    <p className="text-slate-500 text-lg max-w-2xl mx-auto">
                        Choose the plan that fits your needs. No hidden fees, cancel any time.
                    </p>
                </div>

                {/* Pricing Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
                    {plans.map((plan, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.2, duration: 0.5 }}
                            whileHover={{ y: -10 }}
                            className={`relative p-8 rounded-3xl border ${
                                plan.highlight 
                                ? "border-sky-500 shadow-2xl shadow-blue-100 bg-white scale-105 z-10" 
                                : "border-slate-100 shadow-sm bg-white"
                            }`}
                        >
                            {plan.highlight && (
                                <span className="absolute -top-4 left-1/2 -translate-x-1/2 bg-sky-500 text-white px-4 py-1 rounded-full text-sm font-bold">
                                    Most Popular
                                </span>
                            )}

                            <h3 className="text-xl font-bold text-slate-900 mb-2">{plan.name}</h3>
                            <div className="mb-4">
                                <span className="text-5xl font-extrabold text-slate-900">${plan.price}</span>
                                <span className="text-slate-500 font-medium">/month</span>
                            </div>
                            <p className="text-slate-500 text-sm mb-8">{plan.desc}</p>

                            <ul className="space-y-4 mb-10">
                                {plan.features.map((feature, i) => (
                                    <li key={i} className="flex items-center gap-3 text-slate-600 text-sm">
                                        <Check className="w-5 h-5 text-sky-500 flex-shrink-0" />
                                        {feature}
                                    </li>
                                ))}
                            </ul>

                            <button className={`w-full py-4 rounded-xl font-bold transition-all ${
                                plan.highlight 
                                ? "bg-sky-500 text-white hover:bg-sky-600 shadow-lg shadow-blue-200" 
                                : "bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200"
                            }`}>
                                {plan.buttonText}
                            </button>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Pricing;