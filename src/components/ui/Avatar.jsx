

export default function Avatar({ name = "" }) {

const colors = ["bg-blue-500", "bg-green-500", "bg-purple-500", "bg-pink-500", "bg-yellow-500"];

function getColorFromName(name = "") {
  const hash = name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colors[hash % colors.length];
}
const getInitials = (n) => {
    if (!n) return "?";
    const parts = n.trim().split(" ");
    if (parts.length === 1) return parts[0][0].toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
    };

  const initials = getInitials(name);
  const colorClass = getColorFromName(name);

  return (
    <div
      className={`flex items-center justify-center rounded-full text-white font-semibold ${colorClass}`}
      style={{
        width: 24,
        height: 24,
        fontSize: 12,
      }}
    >
      {initials}
    </div>
  );
}
