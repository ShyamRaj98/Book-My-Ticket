import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import { Autoplay, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

export function MovieCarousel({ movies }) {
  return (
    <div className="px-8 my-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Recommended Movies</h2>
        <a href="#" className="text-red-500 text-sm">
          See All ›
        </a>
      </div>

      <Swiper
        modules={[Navigation]}
        navigation
        spaceBetween={20}
        slidesPerView={2}
        breakpoints={{
          640: { slidesPerView: 3 },
          1024: { slidesPerView: 5 },
        }}
      >
        {movies.map((movie) => (
          <SwiperSlide key={movie.id}>
            <div className="rounded-xl overflow-hidden shadow hover:scale-105 transition">
              <img
                src={movie.image}
                alt={movie.title}
                className="w-full h-64 object-cover"
              />
              <div className="p-2">
                <h3 className="font-semibold text-sm">{movie.title}</h3>
                {movie.promoted && (
                  <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded mt-1 inline-block">
                    PROMOTED
                  </span>
                )}
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}

export function BannerSlider({ banners }) {
  return (
    <div className="w-full my-4">
      <Swiper
        modules={[Autoplay, Pagination]}
        autoplay={{ delay: 3000 }}
        pagination={{ clickable: true }}
        loop
      >
        {banners.map((banner) => (
          <SwiperSlide key={banner.id}>
            <div
              className="relative w-full h-[300px] md:h-[400px] bg-cover bg-center rounded-xl overflow-hidden"
              style={{ backgroundImage: `url(${banner.image})` }}
            >
              <div className="absolute inset-0 bg-black/40 flex flex-col justify-center items-start px-10 text-white">
                <h2 className="text-2xl md:text-4xl font-bold mb-3">
                  {banner.title}
                </h2>
                <button className="bg-red-500 px-4 py-2 rounded-lg text-white text-sm">
                  {banner.button}
                </button>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
