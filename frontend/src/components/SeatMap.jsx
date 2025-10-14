import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { toggleSeat } from "../features/seats/seatsSlice";
import { MdEventSeat } from "react-icons/md"; // seat icon

export default function SeatMap({ seats = [], layout = null, screen }) {
  const dispatch = useDispatch();
  const selected = useSelector((s) => s.seats.selected);

  // derive row order
  const rows = layout
    ? layout.rows
    : Array.from(new Set(seats.map((s) => s.row))).sort();

  // group seats by row
  const seatsByRow = {};
  for (const row of rows) seatsByRow[row] = [];
  for (const seat of seats) {
    if (!seatsByRow[seat.row]) seatsByRow[seat.row] = [];
    seatsByRow[seat.row].push(seat);
  }
  for (const r of Object.keys(seatsByRow))
    seatsByRow[r].sort((a, b) => a.number - b.number);

  const onSeatClick = (seat) => {
    if (seat.status !== "available") return;
    dispatch(toggleSeat(seat.seatId));
  };

  // color styles by seat type/status
  const getSeatColor = (seat) => {
    if (seat.status === "booked") return "text-red-500";
    if (seat.status === "held") return "text-yellow-400";
    if (seat.status === "unavailable") return "text-gray-400";
    if (selected.includes(seat.seatId)) return "text-green-600";
    if (seat.type === "vip") return "text-purple-500";
    if (seat.type === "premium") return "text-blue-500";
    return "text-gray-700";
  };

  return (
    <div className="p-4 bg-gray-50 rounded-lg shadow-md w-full mx-auto">
      {/* Screen bar */}
      <div className="w-full h-10 bg-gray-800 text-white flex items-center justify-center rounded mb-6">
        {screen || "Screen"}
      </div>

      {/* Seat rows */}
      <div className="w-full overflow-x-scroll sm:overflow-hidden">
        <div className="w-full space-y-1">
          {rows.map((row) => (
            <div key={row} className="flex items-center gap-3 justify-center">
              <div className="w-6 text-sm font-semibold text-gray-700">
                {row}
              </div>

              <div className="flex gap-3 flex-nowrap justify-center">
                {seatsByRow[row].map((seat) => (
                  <div
                    key={seat.seatId}
                    className="flex flex-col flex-nowrap items-center cursor-pointer"
                    onClick={() => onSeatClick(seat)}
                  >
                    <MdEventSeat
                      className={`text-3xl transition-all duration-200 ${getSeatColor(
                        seat
                      )} ${
                        seat.status === "available"
                          ? "hover:scale-110"
                          : "opacity-80 cursor-not-allowed"
                      }`}
                      title={`${seat.seatId} - ₹${seat.price}`}
                    />
                    <div className="text-xs font-medium mt-1">
                      {seat.seatId}
                    </div>
                    <div className="text-[10px] text-gray-500">
                      ₹{seat.price}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="mt-8 flex flex-wrap justify-center gap-x-6 gap-y-4 text-xs">
        <div className="flex items-center gap-1 text-green-600">
          <MdEventSeat className="text-lg" /> Selected
        </div>
        <div className="flex items-center gap-1">
          <MdEventSeat className="text-lg text-purple-500" />
          <MdEventSeat className="text-lg text-blue-500" />
          <MdEventSeat className="text-lg text-gray-700" /> Available
        </div>
        <div className="flex items-center gap-1 text-red-500">
          <MdEventSeat className="text-lg" /> Booked
        </div>
        <div className="flex items-center gap-1 text-yellow-400">
          <MdEventSeat className="text-lg" /> Held
        </div>
      </div>
    </div>
  );
}
