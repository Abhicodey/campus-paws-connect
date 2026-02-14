import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Gift, Cake, Users, HeartHandshake, ArrowRight, Ambulance } from "lucide-react";
import BottomNav from "@/components/BottomNav";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { OFFICIAL } from "@/constants/official";
import { LayoutContainer } from "@/components/layout-container"; // Added import

export default function Community() {
    return (

        <div className="min-h-screen bg-background pb-24">
            <LayoutContainer>
                <header className="bg-brand pt-8 pb-16 px-6 h-48 rounded-3xl relative z-0 mb-8">
                    <div className="relative z-10">
                        <h1 className="text-3xl font-bold text-white mb-2">Community</h1>
                        <p className="text-white/90 text-sm max-w-xs">
                            Join hands to build a safer and happier campus for our furry friends. 🐾
                        </p>
                    </div>
                    {/* Decorative Pattern */}
                    <div className="absolute inset-0 bg-[url('/paw-pattern.png')] opacity-10 pointer-events-none" />
                </header>

                <div className="max-w-md mx-auto px-6 -mt-20 space-y-6 relative z-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:space-y-0 md:max-w-none">

                    {/* 1. Support Campus Dogs */}
                    <div className="max-w-xl w-full">
                        <Card className="border-none shadow-lg overflow-hidden h-full">
                            <div className="bg-gradient-to-r from-orange-100 to-amber-50 h-2" />
                            <CardHeader className="pb-3">
                                <CardTitle className="flex gap-2 items-center text-xl text-brand">
                                    <Gift className="w-6 h-6" /> Support Campus Dogs
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <p className="text-sm text-foreground/80 leading-relaxed">
                                    Help us provide food, medical care, vaccinations and emergency treatment for campus dogs.
                                    Every contribution — big or small — directly improves their lives 🐶
                                </p>
                                <Link to="/donate" className="block">
                                    <Button className="w-full font-bold shadow-sm" size="lg">
                                        Donate Now <ArrowRight className="w-4 h-4 ml-2" />
                                    </Button>
                                </Link>
                                <p className="text-[10px] text-muted-foreground text-center bg-gray-50 p-2 rounded border">
                                    Payments are used only for food, treatment, sterilization and shelter support.
                                    Monthly expense transparency will be shared with the community.
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* 2. Celebrate Your Day */}
                    <div className="max-w-xl w-full">
                        <Card className="border-none shadow-md h-full">
                            <CardHeader className="pb-3">
                                <CardTitle className="flex gap-2 items-center text-xl text-pink-600">
                                    <Cake className="w-6 h-6" /> Celebrate With Us
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <p className="text-sm text-foreground/80">
                                    Make your birthday or special day meaningful ❤️ <br />
                                    Celebrate by feeding campus dogs, sponsoring meals or arranging treats for them.
                                </p>
                                <div className="grid grid-cols-2 gap-2 text-xs font-medium text-foreground/70">
                                    <div className="bg-pink-50 p-2 rounded text-center">Sponsor Day Food</div>
                                    <div className="bg-pink-50 p-2 rounded text-center">Feed Personally</div>
                                    <div className="bg-pink-50 p-2 rounded text-center">Donate Treats</div>
                                    <div className="bg-pink-50 p-2 rounded text-center">Sponsor Vax</div>
                                </div>
                                <div className="pt-2 border-t border-dashed">
                                    <p className="text-sm font-semibold mb-2">Plan My Celebration</p>
                                    <a
                                        href={`mailto:${OFFICIAL.email}?subject=Birthday Celebration with CampusPaws`}
                                        className="flex items-center justify-center gap-2 w-full border-2 border-pink-100 bg-pink-50 text-pink-700 hover:bg-pink-100 py-2 rounded-lg font-medium transition-colors"
                                    >
                                        Contact Team
                                    </a>
                                    <p className="text-[10px] text-muted-foreground mt-2 text-center">
                                        To celebrate with us, contact the team at least 2 days before your date.
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* 3. Become a Member */}
                    <div className="max-w-xl w-full">
                        <Card className="border-none shadow-md h-full">
                            <CardHeader className="pb-3">
                                <CardTitle className="flex gap-2 items-center text-xl text-indigo-600">
                                    <Users className="w-6 h-6" /> Become a Member
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <p className="text-sm text-foreground/80">
                                    Join CampusPaws and actively help dogs on campus.
                                    Members participate in feeding drives, rescue coordination, awareness activities and adoption support.
                                </p>
                                <ul className="text-xs space-y-2 text-muted-foreground bg-indigo-50/50 p-3 rounded-lg">
                                    <li className="flex gap-2"><HeartHandshake className="w-3 h-3 text-indigo-500 mt-0.5" /> Access to rescue coordination groups</li>
                                    <li className="flex gap-2"><HeartHandshake className="w-3 h-3 text-indigo-500 mt-0.5" /> Feeding updates & alerts</li>
                                    <li className="flex gap-2"><HeartHandshake className="w-3 h-3 text-indigo-500 mt-0.5" /> Priority event participation</li>
                                    <li className="flex gap-2"><HeartHandshake className="w-3 h-3 text-indigo-500 mt-0.5" /> Official participation certificate</li>
                                </ul>
                                <Button
                                    variant="outline"
                                    className="w-full border-indigo-200 text-indigo-700 hover:bg-indigo-50 hover:text-indigo-800"
                                    onClick={() => window.open(OFFICIAL.recruitmentForm, "_blank")}
                                >
                                    Join Membership Form
                                </Button>
                            </CardContent>
                        </Card>
                    </div>

                    {/* 4. Community Guidelines */}
                    <div className="pt-4 md:col-span-2 lg:col-span-3">
                        <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                            📜 Community Guidelines
                        </h3>
                        <div className="bg-surface rounded-xl p-5 shadow-sm border border-border space-y-4">
                            <p className="text-sm text-muted italic">To ensure safety of both students and dogs, please follow these:</p>
                            <ul className="space-y-3 text-sm text-primary">
                                <li className="flex gap-3">
                                    <span className="text-red-500 font-bold">•</span> Do not hit, scare or chase dogs
                                </li>
                                <li className="flex gap-3">
                                    <span className="text-red-500 font-bold">•</span> Avoid feeding harmful food (chocolate, spicy, bones)
                                </li>
                                <li className="flex gap-3">
                                    <span className="text-green-500 font-bold">•</span> Inform members before large feeding
                                </li>
                                <li className="flex gap-3">
                                    <span className="text-red-500 font-bold">•</span> Do not relocate dogs
                                </li>
                                <li className="flex gap-3">
                                    <span className="text-orange-500 font-bold">•</span> Injured dog → report immediately
                                </li>
                                <li className="flex gap-3">
                                    <span className="text-green-500 font-bold">•</span> Respect feeding zones & keep water bowls clean
                                </li>
                            </ul>

                            <div className="mt-4 bg-red-50 border border-red-100 rounded-lg p-3 flex gap-3 items-center">
                                <Ambulance className="w-5 h-5 text-red-600" />
                                <div className="flex-1">
                                    <p className="text-xs font-bold text-red-800 uppercase">Emergency</p>
                                    <p className="text-xs text-red-700">Report injured/sick dogs using the <Link to="/report/dog" className="underline font-medium">Report Dog</Link> feature.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </LayoutContainer>
            <BottomNav />
        </div>
    );
}
