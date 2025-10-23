import React, { useState, useRef, useEffect } from "react";
import { BsCalendar2EventFill } from "react-icons/bs";
import { AiFillEye, AiFillEyeInvisible } from "react-icons/ai";

/* 
✅ Improvements:
- Fixed password visibility logic.
- Added consistent focus ring & shadow.
- Improved typography & spacing.
*/

export const PasswordField = ({
  label,
  value,
  onChange,
  placeholder,
  name = "password",
}) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="w-full">
      {label && (
        <h3 className="mb-2 text-gray-800 text-md md:text-lg font-semibold">
          {label}
        </h3>
      )}
      <div className="relative">
        <input
          name={name}
          type={showPassword ? "text" : "password"}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="w-full outline-0 focus:border-red-500 focus:border-l-4 border border-gray-300 bg-white text-gray-900 p-3 rounded-lg transition-colors pr-10 shadow-sm"
        />
        <span
          onClick={() => setShowPassword((prev) => !prev)}
          className="absolute right-3 top-3 text-gray-600 hover:text-red-500 cursor-pointer transition"
        >
          {showPassword ? (
            <AiFillEyeInvisible size={22} />
          ) : (
            <AiFillEye size={22} />
          )}
        </span>
      </div>
    </div>
  );
};

export const InputField = ({
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  disabled = false,
  name,
}) => (
  <div className="w-full">
    {label && (
      <h3 className="mb-2 text-gray-800 text-md md:text-lg font-semibold">
        {label}
      </h3>
    )}
    {type === "textarea" ? (
      <textarea
        name={name}
        value={value ?? ""}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        className="w-full outline-0 focus:border-red-500 focus:border-l-4 border border-gray-300 bg-white text-gray-900 p-3 rounded-lg transition-colors shadow-sm"
      />
    ) : (
      <input
        name={name}
        type={type}
        value={value ?? ""}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        className="w-full outline-0 focus:border-red-500 focus:border-l-4 border border-gray-300 bg-white text-gray-900 p-3 rounded-lg transition-colors shadow-sm"
      />
    )}
  </div>
);

export const DateInput = ({ label, value, onChange, name }) => {
  const inputRef = useRef(null);

  return (
    <div className="w-full relative">
      {label && (
        <h3 className="mb-2 text-gray-800 text-md md:text-lg font-semibold">
          {label}
        </h3>
      )}
      <div
        className="flex items-center border border-gray-300 hover:border-red-500 focus:border-l-4 bg-white cursor-pointer rounded-lg shadow-sm"
        onClick={() => inputRef.current?.showPicker()}
      >
        <input
          ref={inputRef}
          name={name}
          type="date"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full focus:outline-none border-none p-3 text-gray-900 bg-transparent"
        />
        <BsCalendar2EventFill size={22} className="mr-3 text-red-500" />
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
  name,
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
    <div className="w-full relative" ref={dropdownRef}>
      {label && (
        <h3 className="block text-gray-800 text-md md:text-lg font-semibold mb-2">
          {label}
        </h3>
      )}

      <div
        className="flex justify-between items-center border border-gray-300 focus:border-red-500 focus:border-l-4 bg-white text-gray-900 p-3 rounded-lg cursor-pointer transition-colors shadow-sm"
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

export const TypeSelectInput = ({
  label,
  options = [],
  value,
  onChange,
  placeholder = "Select or type...",
  name,
}) => {
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState(value || "");
  const dropdownRef = useRef(null);

  useEffect(() => {
    setInputValue(value || "");
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filter options based on what user types
  const filteredOptions = options.filter((opt) =>
    opt.label.toLowerCase().includes(inputValue.toLowerCase())
  );

  const handleSelect = (val) => {
    onChange(val);
    setInputValue(val);
    setOpen(false);
  };

  return (
    <div className="w-full relative" ref={dropdownRef}>
      {label && (
        <h3 className="block text-gray-800 text-md md:text-lg font-semibold mb-2">
          {label}
        </h3>
      )}

      <div className="relative">
        <input
          type="text"
          value={inputValue}
          name={name}
          placeholder={placeholder}
          onChange={(e) => {
            setInputValue(e.target.value);
            onChange(e.target.value); // Allow custom typed values
            setOpen(true); // open dropdown while typing
          }}
          onClick={() => setOpen((prev) => !prev)}
          className="w-full border border-gray-300 focus:border-red-500 bg-white text-gray-900 p-3 rounded-lg shadow-sm outline-none"
        />
        <svg
          className={`absolute right-3 top-4 w-4 h-4 transform transition-transform ${
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

      {open && filteredOptions.length > 0 && (
        <ul className="absolute z-10 w-full mt-1 max-h-48 overflow-auto rounded-md border border-gray-300 bg-white shadow-lg">
          {filteredOptions.map((opt) => (
            <li
              key={opt.value}
              onClick={() => handleSelect(opt.value)}
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

export default { InputField, PasswordField, DateInput, SelectInput, TypeSelectInput };
