// src/app/privacy/page.tsx
import { PageTransition } from "@/components/animations/PageTransition";
import Link from "next/link";
import { ChevronLeft, ShieldCheck } from "lucide-react";

export default function PrivacyPage() {
  return (
    <PageTransition>
      <main className="min-h-screen bg-zinc-950 pt-32 pb-20 px-8 md:px-24">
        <div className="max-w-3xl mx-auto space-y-8">
          <div className="flex items-center gap-4 mb-8">
            <Link href="/" className="p-2 hover:bg-white/10 rounded-full transition-colors text-zinc-400">
              <ChevronLeft />
            </Link>
            <h1 className="text-3xl font-black uppercase tracking-tighter flex items-center gap-3">
              <ShieldCheck className="text-blue-500" /> Política de Privacidad
            </h1>
          </div>

          <div className="prose prose-invert max-w-none text-zinc-400 leading-relaxed space-y-6">
            <p>
              En <strong>ARMOVIE</strong>, accesible desde nuestro sitio web, una de nuestras principales prioridades es la privacidad de nuestros visitantes. Este documento de Política de Privacidad contiene tipos de información que ARMOVIE recoge y registra y cómo la utilizamos.
            </p>
            
            <h2 className="text-xl font-bold text-white uppercase mt-8">Archivos de Registro</h2>
            <p>
              ARMOVIE sigue un procedimiento estándar de uso de archivos de registro. Estos archivos registran a los visitantes cuando visitan sitios web. La información recogida por los archivos de registro incluye direcciones de protocolo de Internet (IP), tipo de navegador, proveedor de servicios de Internet (ISP), sello de fecha y hora, páginas de referencia/salida y, posiblemente, el número de clics.
            </p>

            <h2 className="text-xl font-bold text-white uppercase mt-8">Novedad: Almacenamiento Local (Local Storage)</h2>
            <p>
              Nuestra aplicación utiliza la tecnología de <strong>LocalStorage</strong> para permitirte guardar tus películas y series favoritas ("Mi Lista") directamente en tu navegador. Esta información no se envía a nuestros servidores y permanece bajo tu control exclusivo.
            </p>

            <h2 className="text-xl font-bold text-white uppercase mt-8">Publicidad de Terceros</h2>
            <p>
              Podemos mostrar anuncios de redes de terceros. Estas redes pueden utilizar tecnologías como cookies y web beacons en sus anuncios, lo que enviará a estos anunciantes tu dirección IP para medir la eficacia de sus campañas publicitarias y/o para personalizar el contenido publicitario que ves.
            </p>

            <p>
              Si requiere más información o tiene alguna duda sobre nuestra política de privacidad, no dude en contactarnos por correo electrónico.
            </p>
          </div>
        </div>
      </main>
    </PageTransition>
  );
}
