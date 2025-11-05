import loaderpage from "../assets/images/Video_Camera.gif";
import loader_img from "../assets/images/loader_film.png";

const Loading = ({ text = "Loading...", loader = "page" }) => {
  return (
    <>
      {loader === "page" ? (
        <div className="w-full h-[95vh] flex flex-col items-center justify-center py-10 rounded-2xl overflow-hidden">
          <img src={loaderpage} className="w-[200px] h-[200px] rounded-full" />
          <p className="mt-3 text-gray-700 font-medium">{text}</p>
        </div>
      ) : (
        <div className="w-full flex flex-col items-center justify-center py-10 rounded-2xl overflow-hidden">
          <div
            style={{
              backgroundImage: `url(${loader_img})`,
              backgroundRepeat: "no-repeat",
              backgroundSize: "contain",
            }}
            className=" flex items-center justify-center w-[150px] h-[150px] border-4 border-gray-200 rounded-full dark:border-red-700 animate-spin duration-50 bg-m"
          ></div>
          <p className="mt-3 text-gray-700 font-medium">{text}</p>
        </div>
      )}
    </>
  );
};

export default Loading;
