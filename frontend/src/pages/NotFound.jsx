import { Link } from "react-router-dom";
import Error404 from "../assets/video/404.mp4";

export default function NotFound() {
  return (
    <div className="bg-red-200 w-full h-[95vh] flex items-center justify-center overflow-hidden text-white">
      <div className="w-[200px] flex flex-col items-center justify-center mx-auto">
        {/* Background video */}
        <video autoPlay loop muted className="w-full h-full object-cover rounded-2xl shadow-lg">
          <source src={Error404} type="video/mp4" />
        </video>

        {/* Content */}
        <div className=" text-center px-6 ">
          <h1 className="text-6xl font-bold mb-4">404</h1>
          <p className="text-xl mb-6 opacity-90">Oops! Page not found.</p>

          <Link
            to="/"
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold shadow-lg transition-all duration-200"
          >
            Go Home
          </Link>
        </div>
      </div>
    </div>
  );
}
