import { TopMenu } from '../../components/ui/top-menu/TopMenu';
import Footer from '../../components/ui/footer/Footer';


export default function WebLayout({ children }: { children: React.ReactNode;}) {
    return (
        <main className="grid min-h-dvh grid-rows-[auto_1fr_auto]">
            <TopMenu/>
            {children}
            <Footer/>
        </main>
    );
}
