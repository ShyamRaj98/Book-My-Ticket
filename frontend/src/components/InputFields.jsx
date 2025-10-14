// client/src/components/InputsFields.jsx
import React, { useState, useRef, useEffect } from "react";
import { BsCalendar2EventFill } from "react-icons/bs";

export const InputField = ({
  label,
  type = "text",
  value,
  onChange,
  placeholder,
}) => {
  return (
    <div>
      {label && (
        <h3 className="mb-2 text-gray-800 text-md md:text-lg font-semibold">
          {label}
        </h3>
      )}
      {type === "textarea" ? (
        <textarea
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="w-full focus:outline-none border-2 border-gray-300 hover:border-red-500 bg-white text-gray-900 p-2 rounded transition-colors"
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="w-full focus:outline-none border-2 border-gray-300 hover:border-red-500 bg-white text-gray-900 p-2 rounded transition-colors"
        />
      )}
    </div>
  );
};

export const DateInput = ({ label, value, onChange }) => {
  const inputRef = useRef(null);

  return (
    <div className="w-full relative">
      {label && (
        <h3 className="mb-2 text-gray-800 text-md md:text-lg font-semibold">
          {label}
        </h3>
      )}
      <div
        className="flex items-center border-2 border-gray-300 hover:border-red-500 bg-white cursor-pointer rounded transition-colors"
        onClick={() => inputRef.current?.showPicker()}
      >
        <input
          ref={inputRef}
          type="date"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full focus:outline-none border-none p-2 text-gray-900 pr-10 bg-transparent"
        />
        <BsCalendar2EventFill size={24} className="mr-2 text-red-500" />
      </div>
    </div>
  );
};

export const SelectInput = ({
  label,
  options = [],
  value,
  onChange,
  placeholder = "Select...",
  className = "",
}) => {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedLabel =
    options.find((opt) => opt.value === value)?.label || placeholder;

  return (
    <div className={`w-full ${className} relative`} ref={dropdownRef}>
      {label && (
        <h3 className="block text-gray-800 text-md md:text-lg font-semibold mb-2">
          {label}
        </h3>
      )}

      <div
        className="flex justify-between items-center border-2 border-gray-300 hover:border-red-500 bg-white text-gray-900 p-2 rounded cursor-pointer transition-colors"
        onClick={() => setOpen((prev) => !prev)}
      >
        <span className={value ? "" : "text-gray-400"}>{selectedLabel}</span>
        <svg
          className={`w-4 h-4 transform transition-transform ${
            open ? "rotate-180" : ""
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </div>

      {open && (
        <ul className="absolute z-10 w-full mt-1 max-h-48 overflow-auto rounded-md border border-gray-300 bg-white shadow-lg">
          {options.map((opt) => (
            <li
              key={opt.value}
              onClick={() => {
                onChange(opt.value);
                setOpen(false);
              }}
              className={`px-3 py-2 cursor-pointer hover:bg-red-100 ${
                opt.value === value ? "bg-red-200" : ""
              } transition-colors`}
            >
              {opt.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default { InputField, SelectInput, DateInput };
