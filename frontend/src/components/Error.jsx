const Error = ({ message = "Something went wrong!" }) => {
  return (
    <div className="p-4 m-5 text-red-600 bg-red-50 border border-red-200 rounded text-center w-fit mx-auto">
      ❌ {message}
    </div>
  );
};

export default Error;