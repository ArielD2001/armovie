// src/app/movie/[id]/page.tsx
import { DetailView } from "@/components/content/DetailView";
import { getTMDBMetadata } from "@/lib/vimeus-service";
import { Metadata } from "next";

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const data = await getTMDBMetadata(id, 'movie');

  if (!data) return { title: 'Pelicula | ARMovie' };

  return {
    title: `${data.title} | ARMovie`,
    description: data.overview?.slice(0, 160),
    openGraph: {
      title: data.title,
      description: data.overview,
      images: [`https://image.tmdb.org/t/p/w780${data.backdrop_path || data.poster_path}`],
      type: 'video.movie',
    },
    twitter: {
      card: 'summary_large_image',
      title: data.title,
      description: data.overview,
      images: [`https://image.tmdb.org/t/p/w780${data.backdrop_path || data.poster_path}`],
    },
  };
}

export default async function MoviePage({ params }: Props) {
  const { id } = await params;
  return <DetailView id={id} type="movie" />;
}
