export const metadata = {
    title: "sarasvatī",
    description: "DJ automático ritual",
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <body style={{ margin: 0, background: "black", overflow: "hidden" }}>
                {children}
            </body>
        </html>
    );
}
