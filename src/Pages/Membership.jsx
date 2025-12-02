import React from 'react';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';

export default function Membership() {
    const features = {
        free: [
            "Access to 1,500+ Free Scripts",
            "3 Downloads per day",
            "Standard Download Speed",
            "15s Waiting Timer",
            "Community Support"
        ],
        vip: [
            "Everything in Free",
            "Unlimited Downloads",
            "High-Speed Direct Links",
            "No Waiting Timer",
            "Access to Premium Assets (Paid/Leaked)",
            "Discord VIP Role",
            "Priority Request Support"
        ]
    };

    return (
        <div className="py-10 max-w-5xl mx-auto">
            <div className="text-center mb-16 space-y-4">
                <Badge variant="outline" className="border-violet-500/50 text-violet-400 bg-violet-500/10 px-4 py-1 text-sm uppercase tracking-widest">
                    Upgrade Your Experience
                </Badge>
                <h1 className="text-4xl md:text-6xl font-bold text-white">
                    Simple, Transparent <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-indigo-400">Pricing</span>
                </h1>
                <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
                    Join over 5,000+ server owners who use FiveM Tools to build their dream servers.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                {/* Free Tier */}
                <Card className="bg-zinc-900 border-zinc-800 relative overflow-hidden transition-all hover:border-zinc-700">
                    <CardHeader className="pb-8">
                        <CardTitle className="text-2xl font-bold text-white">Starter</CardTitle>
                        <CardDescription className="text-zinc-500">Perfect for testing the waters</CardDescription>
                        <div className="mt-6 flex items-baseline">
                            <span className="text-4xl font-bold text-white">$0</span>
                            <span className="text-zinc-500 ml-2">/forever</span>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {features.free.map((f, i) => (
                            <div key={i} className="flex items-start gap-3">
                                <div className="p-1 rounded-full bg-zinc-800 text-zinc-400">
                                    <img src="https://img.icons8.com/3d-fluency/94/checkmark.png" className="w-3 h-3" alt="Check" />
                                </div>
                                <span className="text-zinc-300 text-sm">{f}</span>
                            </div>
                        ))}
                    </CardContent>
                    <CardFooter className="pt-8">
                        <Button variant="outline" className="w-full border-zinc-700 text-zinc-300 hover:bg-zinc-800 h-12">
                            Current Plan
                        </Button>
                    </CardFooter>
                </Card>

                {/* VIP Tier */}
                <Card className="bg-zinc-900 border-violet-500 relative overflow-hidden shadow-[0_0_40px_rgba(124,58,237,0.15)] transform md:-translate-y-4">
                    <div className="absolute top-0 right-0 bg-violet-600 text-white text-xs font-bold px-3 py-1 rounded-bl-lg uppercase tracking-wider">
                        Most Popular
                    </div>
                    <CardHeader className="pb-8">
                        <div className="flex items-center gap-2 mb-2">
                            <img src="https://img.icons8.com/3d-fluency/94/crown.png" className="w-6 h-6" alt="Premium" />
                            <span className="text-amber-400 font-bold tracking-wide uppercase text-sm">Premium</span>
                        </div>
                        <CardTitle className="text-2xl font-bold text-white">Server Owner VIP</CardTitle>
                        <CardDescription className="text-violet-200/60">Unlimited power for your server</CardDescription>
                        <div className="mt-6 flex items-baseline">
                            <span className="text-4xl font-bold text-white">$15</span>
                            <span className="text-zinc-500 ml-2">/month</span>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {features.vip.map((f, i) => (
                            <div key={i} className="flex items-start gap-3">
                                <div className="p-1 rounded-full bg-violet-500/20 text-violet-400">
                                    <img src="https://img.icons8.com/3d-fluency/94/checkmark.png" className="w-3 h-3" alt="Check" />
                                </div>
                                <span className="text-zinc-200 text-sm font-medium">{f}</span>
                            </div>
                        ))}
                    </CardContent>
                    <CardFooter className="pt-8">
                        <Button className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white border-0 h-12 text-lg font-semibold shadow-lg shadow-violet-900/20">
                            Get Instant Access
                        </Button>
                    </CardFooter>
                </Card>
            </div>

            <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-6 bg-zinc-900/50 rounded-xl border border-zinc-800">
                    <img src="https://cdn3d.iconscout.com/3d/premium/thumb/antivirus-3d-icon-png-download-4159679.png" className="w-10 h-10 mx-auto mb-4" alt="Virus Free" />
                    <h3 className="text-white font-bold mb-2">Virus Free</h3>
                    <p className="text-zinc-500 text-sm">Every file is scanned before upload.</p>
                </div>
                <div className="text-center p-6 bg-zinc-900/50 rounded-xl border border-zinc-800">
                    <img src="https://img.icons8.com/3d-fluency/94/lightning-bolt.png" className="w-10 h-10 mx-auto mb-4" alt="Instant" />
                    <h3 className="text-white font-bold mb-2">Instant Delivery</h3>
                    <p className="text-zinc-500 text-sm">Get your files immediately after action.</p>
                </div>
                <div className="text-center p-6 bg-zinc-900/50 rounded-xl border border-zinc-800">
                    <img src="https://img.icons8.com/3d-fluency/94/star.png" className="w-10 h-10 mx-auto mb-4" alt="Quality" />
                    <h3 className="text-white font-bold mb-2">Quality Assured</h3>
                    <p className="text-zinc-500 text-sm">Only the best resources make it here.</p>
                </div>
            </div>
        </div>
    );
}
