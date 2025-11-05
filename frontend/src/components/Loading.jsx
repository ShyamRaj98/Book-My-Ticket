import loaderVideo from "../../public/assets/video/loading.mp4";
import loaderVideo2 from "../../public/assets/video/loading2.mp4";

const Loading = ({ text = "Loading...", loader = "page" }) => {
  return (
    <>
      {loader === "page" ? (
        <div className="w-full max-h-[95vh] flex flex-col items-center justify-center py-10 rounded-2xl overflow-hidden">
          <video
            src={loaderVideo2}
            autoPlay
            loop
            muted
            className="w-24 h-24 rounded-lg"
          />
          <p className="mt-3 text-gray-700 font-medium">{text}</p>
        </div>
      ) : (
        <div className="w-full flex flex-col items-center justify-center py-10 rounded-2xl overflow-hidden">
          <video
            src={loaderVideo}
            autoPlay
            loop
            muted
            className="w-24 h-24 rounded-lg"
          />
          <p className="mt-3 text-gray-700 font-medium">{text}</p>
        </div>
      )}
    </>
  );
};

export default Loading;
