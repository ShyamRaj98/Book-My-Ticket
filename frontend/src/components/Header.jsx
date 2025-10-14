import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { IoSearch } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import { CgProfile } from "react-icons/cg";

function Header() {
  const navigate = useNavigate();
  const auth = useSelector((s) => s.auth);
  const dispatch = useDispatch();

  const handleLogout = () => dispatch(logout());

  return (
    <nav className="bg-white shadow p-3">
      <div className="container px-4 mx-auto flex justify-between items-center">
        <Link to="/">
          <h1 className="logo text-2xl">
            Book<span className="text-red-600">My</span>Ticket
          </h1>
        </Link>
        <div className="flex justify-end items-center gap-3">
          <IoSearch
            size={24}
            color="red"
            className="cursor-pointer"
            onClick={() => navigate("/movies")}
          />
          {auth.user ? (
            <>
              <span className="hidden md:block">
                Hello, {auth.user.name || auth.user.email}
              </span>
              <Link to="/profile">
                <CgProfile size={24} color="red" className="cursor-pointer" />
              </Link>
              <button
                onClick={handleLogout}
                className="hidden md:block text-red-500 bg-white w-full md:w-fit hover:bg-gray-100 p-2 font-semibold border-1 border-gray-300 rounded-xl shadow-xl"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="bg-white w-full md:w-fit hover:bg-gray-100 p-2 font-semibold border-1 border-gray-300 rounded-xl shadow-xl"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="bg-white w-full md:w-fit hover:bg-gray-100 p-2 font-semibold border-1 border-gray-300 rounded-xl shadow-xl"
              >
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
export default Header;
