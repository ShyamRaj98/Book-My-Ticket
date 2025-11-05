import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import { Autoplay, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { Link } from "react-router-dom";

export function MovieCarousel({ movies }) {
  return (
    <div className="my-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Recommended Movies</h2>
        <Link
          to="/movies"
          className="text-red-500 text-sm font-medium p-2 border-1 border-gray-300 rounded shadow-lg"
        >
          See All ›
        </Link>
      </div>

      <Swiper
        modules={[Navigation]}
        spaceBetween={20}
        slidesPerView={2}
        breakpoints={{
          500: { slidesPerView: 2 },
          640: { slidesPerView: 3 },
          1024: { slidesPerView: 5 },
        }}
      >
        {movies.map((movie) => (
          <SwiperSlide key={movie.id} className="my-2">
            <Link to={movie.link || "#"}>
              <div className="h-full rounded-xl shadow transition overflow-hidden">
                <div className="h-full overflow-hidden">
                  <img
                    src={movie.image}
                    alt={movie.title}
                    className="w-full h-full object-cover transition hover:scale-105"
                  />
                </div>
                <div className="p-2 h-[50px]">
                  <h3 className="font-semibold text-md line-clamp-2">
                    {movie.title}
                  </h3>
                </div>
              </div>
            </Link>
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
