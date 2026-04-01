// src/app/dmca/page.tsx
import { PageTransition } from "@/components/animations/PageTransition";
import Link from "next/link";
import { ChevronLeft, Gavel } from "lucide-react";

export default function DMCAPage() {
  return (
    <PageTransition>
      <main className="min-h-screen bg-zinc-950 pt-32 pb-20 px-8 md:px-24">
        <div className="max-w-3xl mx-auto space-y-8">
          <div className="flex items-center gap-4 mb-8">
            <Link href="/" className="p-2 hover:bg-white/10 rounded-full transition-colors text-zinc-400">
              <ChevronLeft />
            </Link>
            <h1 className="text-3xl font-black uppercase tracking-tighter flex items-center gap-3">
              <Gavel className="text-blue-500" /> Política DMCA
            </h1>
          </div>

          <div className="prose prose-invert max-w-none text-zinc-400 leading-relaxed space-y-6">
            <p>
              <strong>ARMOVIE</strong> respeta la propiedad intelectual de terceros. Nos tomamos muy en serio los asuntos de Propiedad Intelectual y nos comprometemos a satisfacer las necesidades de los propietarios de contenido mientras les ayudamos a gestionar la publicación de su contenido en línea.
            </p>
            <p>
              Es importante destacar que <strong>ARMOVIE es un simple motor de búsqueda de videos</strong> y no aloja ningún videoclip, archivo ni material en sus servidores. Solo indexamos enlaces de sitios de terceros (como Vimeus, YouTube, Dailymotion, etc.).
            </p>
            <h2 className="text-xl font-bold text-white uppercase mt-8">Notificación de Infracción de Derechos de Autor</h2>
            <p>
              Si cree que su trabajo con derechos de autor ha sido copiado de una manera que constituye una infracción y es accesible en este sitio, puede notificarlo a nuestro agente de derechos de autor, según lo establecido en la Ley de Derechos de Autor del Milenio Digital (DMCA).
            </p>
            <p>
              Para que su queja sea válida bajo la DMCA, debe proporcionar la siguiente información al dar aviso de la supuesta infracción:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Una firma física o electrónica de una persona autorizada para actuar en nombre del propietario del derecho de autor.</li>
              <li>Identificación de la obra protegida por derechos de autor que se afirma ha sido infringida.</li>
              <li>Identificación del material que se afirma que está infringiendo.</li>
              <li>Información razonablemente suficiente para permitir que el proveedor del servicio se ponga en contacto con la parte reclamante (dirección, número de teléfono, correo electrónico).</li>
              <li>Una declaración de que la parte reclamante cree de buena fe que el uso del material no está autorizado por el propietario del derecho de autor.</li>
            </ul>
            <p className="bg-white/5 p-4 rounded-lg border border-white/10 text-center">
              Por favor envíe cualquier aviso de infracción a: <strong>dmca@armovie.com</strong>
            </p>
          </div>
        </div>
      </main>
    </PageTransition>
  );
}
