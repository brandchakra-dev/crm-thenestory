export default function PunchButtons({ onPunchIn, onPunchOut }) {
    return (
      <div className="flex gap-3">
        <button onClick={onPunchIn} className="bg-green-600 text-white px-4 py-2 rounded">
          Punch In
        </button>
        <button onClick={onPunchOut} className="bg-red-600 text-white px-4 py-2 rounded">
          Punch Out
        </button>
      </div>
    );
  }
  