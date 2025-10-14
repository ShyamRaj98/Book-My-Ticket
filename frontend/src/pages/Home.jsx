import React from "react";
import { BannerSlider, MovieCarousel } from "../components/HomePageSection";
import { banners, movies } from "../data/dummyData";

export default function Home() {
  return (
    <div className="container mx-auto px-4 bg-gray-100 min-h-screen">
      <BannerSlider banners={banners} />
      <MovieCarousel movies={movies} />
    </div>
  );
}
