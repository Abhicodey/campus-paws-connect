import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import Page from "@/components/layout/Page";

export default function Guidelines() {
    return (
        <div className="flex flex-col w-full h-full">
            <header className="bg-primary py-6 px-6">
                <div className="flex items-center gap-4 max-w-7xl mx-auto md:px-6">
                    <Link to="/" className="text-primary-foreground/80 hover:text-white">
                        <ArrowLeft className="w-6 h-6" />
                    </Link>
                    <h1 className="text-xl font-bold text-white">Guidelines</h1>
                </div>
            </header>

            <Page className="pt-6">
                <div className="max-w-3xl mx-auto space-y-6">

                    <Card>
                        <CardHeader>
                            <CardTitle>🐶 Campus Dog Guidelines</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3 text-sm leading-relaxed text-muted-foreground">

                            <p>• Do not scare or chase campus dogs.</p>
                            <p>• Avoid flash photography near animals.</p>
                            <p>• Report injured dogs via the app immediately.</p>
                            <p>• Feed only in designated areas.</p>
                            <p>• Respect volunteers and caregivers.</p>

                        </CardContent>
                    </Card>

                </div>
            </Page>
        </div>
    );
}
