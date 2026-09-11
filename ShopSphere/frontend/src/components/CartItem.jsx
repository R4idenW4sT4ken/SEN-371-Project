export default function CartItem({ item }) {
  return (
    <div className="card">
      <strong>{item.name}</strong>
      <span>Quantity: {item.quantity}</span>
    </div>
  );
}
