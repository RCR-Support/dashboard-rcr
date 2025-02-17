import { Roboto, Open_Sans } from "next/font/google";

export const roboto = Roboto({
    weight: ['400', '700'],
    style: ['normal', 'italic'],
    subsets: ['latin'],
});

export const secundaryFont = Open_Sans({
    subsets: ["latin"],
    weight: ['300', '400','600','700', '800'],
});
