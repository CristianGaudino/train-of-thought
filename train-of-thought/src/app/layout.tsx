import "@/styles/globals.css";
import { Metadata } from 'next';
import { montserrat, spectral } from '../components/ui/fonts';

export const metadata: Metadata = {
    title: {
        template: '%s | Train of Thought',
        default: 'Train of Thought',
    },
    description: "Capture, explore, and create ideas with AI.",
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <body className={`${montserrat.variable} ${spectral.variable} font-primary antialiased bg-zinc-50 text-zinc-900`}>
                {children}
            </body>
        </html>
    );
}
