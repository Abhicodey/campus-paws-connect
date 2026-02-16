import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, CreditCard, Heart, CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";
import Page from "@/components/layout/Page";

export default function Donate() {
    const donationOptions = [
        { amount: 50, label: "Biscuits", icon: "🍪" },
        { amount: 150, label: "One Meal", icon: "meals" }, // Using text/emoji as icon placeholder or lucide
        { amount: 500, label: "Medical Support", icon: "💊" },
        { amount: 1500, label: "Vaccination", icon: "💉" },
        { amount: 3000, label: "Sterilization Sponsor", icon: "🏥" },
    ];

    const handleDonate = (amount: number) => {
        // Razorpay integration would go here
        alert(`Proceeding to pay ₹${amount} via Razorpay... (Integration Pending)`);
    };

    return (
        <div className="flex flex-col w-full h-full">
            <header className="bg-brand py-6 px-6 shadow-md w-full">
                <div className="flex items-center gap-4 max-w-7xl mx-auto md:px-6">
                    <Link to="/community" className="text-white/80 hover:text-white transition-colors">
                        <ArrowLeft className="w-6 h-6" />
                    </Link>
                    <h1 className="text-xl font-bold text-white">Donate</h1>
                </div>
            </header>

            <Page className="pt-6">
                <div className="max-w-md mx-auto space-y-6">

                    <div className="text-center space-y-2">
                        <div className="mx-auto w-16 h-16 bg-brand/10 rounded-full flex items-center justify-center mb-4">
                            <Heart className="w-8 h-8 text-brand" fill="currentColor" />
                        </div>
                        <h2 className="text-2xl font-bold text-foreground">Reference Amount</h2>
                        <p className="text-muted-foreground text-sm">
                            Choose an amount to support the campus dogs. 100% of your contribution goes towards their food and medical care.
                        </p>
                    </div>

                    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                        {donationOptions.map((option) => (
                            <button
                                key={option.amount}
                                onClick={() => handleDonate(option.amount)}
                                className="bg-card border border-border hover:border-brand/50 hover:bg-brand/5 active:bg-brand/10 transition-all rounded-xl p-4 flex items-center justify-between group shadow-sm hover:shadow-md"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center text-lg shadow-sm border border-accent/20">
                                        {option.icon === 'meals' ? <span className="text-xl">🥘</span> : option.icon}
                                    </div>
                                    <div className="text-left">
                                        <p className="font-bold text-lg text-foreground">₹{option.amount}</p>
                                        <p className="text-xs text-muted-foreground">{option.label}</p>
                                    </div>
                                </div>
                                <CreditCard className="w-5 h-5 text-muted-foreground group-hover:text-brand transition-colors" />
                            </button>
                        ))}
                    </div>

                    {/* Secure Payment Note */}
                    <div className="bg-green-500/10 rounded-lg p-4 flex gap-3 items-start border border-green-500/20">
                        <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 shrink-0" />
                        <div>
                            <p className="font-medium text-green-700 text-sm">Secure Payment</p>
                            <p className="text-xs text-green-600/80 mt-1">
                                Payments are processed securely via Razorpay. Ideal for UPI, Cards, and Netbanking.
                            </p>
                        </div>
                    </div>

                </div>
            </Page>
        </div>
    );
}
