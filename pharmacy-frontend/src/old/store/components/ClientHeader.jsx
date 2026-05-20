import HeroSearch from "./HeroSearch";

export default function ClientHeader({ setSearchTerm }) {
  return (
    <div className="client-header">
      <h1 className="client-title">✚ Online Pharmacy Store</h1>

      <p className="client-subtitle">
        Quality medicine with smart savings on every order.
      </p>

      <HeroSearch onSearchChange={setSearchTerm} />
    </div>
  );
}
