import Footer from '../../components/ui/footer/Footer';

export default function WebLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="grid min-h-dvh grid-rows-[1fr_auto]">
      {children}
      <Footer />
    </main>
  );
}
