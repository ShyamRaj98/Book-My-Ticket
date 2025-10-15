import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { toggleSeat } from "../features/seats/seatsSlice";
import { MdEventSeat } from "react-icons/md";

export default function SeatMap({ seats = [], layout = null, screen }) {
  const dispatch = useDispatch();
  const selected = useSelector((s) => s.seats.selected);

  const rows = layout
    ? layout.rows
    : Array.from(new Set(seats.map((s) => s.row))).sort();

  // group by rows
  const seatsByRow = {};
  for (const row of rows) seatsByRow[row] = [];
  for (const seat of seats) {
    if (!seatsByRow[seat.row]) seatsByRow[seat.row] = [];
    seatsByRow[seat.row].push(seat);
  }
  for (const r of Object.keys(seatsByRow))
    seatsByRow[r].sort((a, b) => a.number - b.number);

  const handleSeatClick = (seat) => {
    if (seat.status !== "available") return;
    dispatch(toggleSeat(seat.seatId));
  };

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
    <div className="p-6 bg-white rounded-xl shadow-md border border-gray-200 max-w-4xl mx-auto">
      {/* Screen */}
      <div className="w-full h-10 bg-gray-800 text-white flex items-center justify-center rounded-t-lg mb-8 text-sm font-semibold tracking-wide">
        {screen || "SCREEN"}
      </div>

      {/* Seats Grid */}
      <div className="overflow-x-auto">
        <div className="space-y-3">
          {rows.map((row) => (
            <div key={row} className="flex items-center justify-center gap-3">
              <span className="font-semibold text-gray-600 w-6">{row}</span>
              <div className="flex gap-3 flex-nowrap justify-center">
                {seatsByRow[row].map((seat) => (
                  <div
                    key={seat.seatId}
                    onClick={() => handleSeatClick(seat)}
                    className="flex flex-col items-center cursor-pointer group"
                  >
                    <MdEventSeat
                      className={`text-3xl transition-all duration-200 ${getSeatColor(
                        seat
                      )} ${
                        seat.status === "available"
                          ? "group-hover:scale-110"
                          : "opacity-60 cursor-not-allowed"
                      }`}
                      title={`${seat.seatId} - ₹${seat.price}`}
                    />
                    <div className="text-xs mt-1 font-medium text-gray-600">
                      {seat.seatId}
                    </div>
                    <div className="text-[10px] text-gray-400">
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
      <div className="mt-10 flex flex-wrap justify-center gap-5 text-sm">
        <Legend color="text-green-600" label="Selected" />
        <Legend color="text-purple-500" label="VIP" />
        <Legend color="text-blue-500" label="Premium" />
        <Legend color="text-gray-700" label="Regular" />
        <Legend color="text-yellow-400" label="Held" />
        <Legend color="text-red-500" label="Booked" />
      </div>
    </div>
  );
}

function Legend({ color, label }) {
  return (
    <div className="flex items-center gap-1 text-gray-700">
      <MdEventSeat className={`text-xl ${color}`} />
      <span>{label}</span>
    </div>
  );
}
