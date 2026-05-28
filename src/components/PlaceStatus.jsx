export function PlaceStatus({ status, reject_reason }) {
  if (status === 0) return <span className="text-green-600">Approved</span>;
  if (status === 1) return <span className="text-yellow-600">Pending</span>;
  if (status === -1) return (
    <span className="text-red-600">
      Rejected{reject_reason ? `: ${reject_reason}` : ""}
    </span>
  );
  return null;
}
