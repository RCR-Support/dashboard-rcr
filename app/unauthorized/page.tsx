'use client';

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function UnauthorizedPage() {
    const router = useRouter();
    const [progress, setProgress] = useState(0);
    const redirectTime = 3000; // 3 segundos
    const updateInterval = 30; // Actualizar cada 30ms para animación suave

    useEffect(() => {
        const startTime = Date.now();
        
        const timer = setInterval(() => {
            const elapsedTime = Date.now() - startTime;
            const newProgress = (elapsedTime / redirectTime) * 100;
            
            if (elapsedTime >= redirectTime) {
                clearInterval(timer);
                router.push('/dashboard');
            } else {
                setProgress(newProgress);
            }
        }, updateInterval);

        return () => clearInterval(timer);
    }, [router]);

    return (
        <>
            {/* Barra de progreso */}
            <div className="fixed top-0 left-0 w-full h-1 bg-gray-200">
                <div 
                    className="h-full bg-blue-500 transition-all duration-200 ease-linear"
                    style={{ width: `${progress}%` }}
                />
            </div>

            <div className="flex flex-col items-center justify-center min-h-screen">
            <div className="p-8 rounded-lg shadow-2xl dark:shadow-slate-800">
                <h1 className="text-3xl font-bold text-red-600 mb-4">
                    Acceso No Autorizado
                </h1>
                <p className=" mb-6">
                    No tienes los permisos necesarios para acceder a esta página.
                </p>
                <p className="text-sm mb-4">
                        Redirigiendo al Dashboard en {Math.max(0, Math.ceil((redirectTime - (progress * redirectTime / 100)) / 1000))} segundos...
                    </p>
                <Link
                    href="/dashboard"
                    className="text-blue-500 hover:text-blue-700 font-medium"
                >
                    Volver al Dashboard ahora
                </Link>
            </div>
        </div>
        </>
    );
}
