function Menu() {
  const menuItems = [
    {
      category: "Entrantes",
      items: [
        { name: "Papas Fritas", description: "Crujientes y doradas.", price: "$2.99", image: "fries.jpg" },
        { name: "Aros de Cebolla", description: "Rebozados y crujientes.", price: "$3.49", image: "onion-rings.jpg" },
        { name: "Alitas de Pollo", description: "Jugosas y picantes.", price: "$5.99", image: "chicken-wings.jpg" },
        { name: "Nachos con Queso", description: "Con queso derretido y jalapeños.", price: "$4.99", image: "nachos.jpg" },
        { name: "Palitos de Mozzarella", description: "Con queso fundido por dentro.", price: "$4.49", image: "mozzarella-sticks.jpg" },
      ],
      
    },
    {
      category: "Hamburguesas",
      items: [
        { name: "Hamburguesa Clásica", description: "La clásica con lechuga, tomate y mayonesa.", price: "$5.99", image: "classic-burger.jpg" },
        { name: "Hamburguesa con Queso", description: "Con queso cheddar derretido.", price: "$6.99", image: "cheese-burger.jpg" },
        { name: "Hamburguesa BBQ", description: "Con salsa BBQ y cebolla caramelizada.", price: "$7.99", image: "bbq-burger.jpg" },
        { name: "Hamburguesa Doble", description: "Doble carne y doble queso.", price: "$8.99", image: "double-burger.jpg" },
        { name: "Hamburguesa Vegana", description: "Hecha con ingredientes 100% vegetales.", price: "$7.49", image: "vegan-burger.jpg" },
      ],
    },
    {
      category: "Postres",
      items: [
        { name: "Helado de Vainilla", description: "Cremoso y delicioso.", price: "$2.99", image: "vanilla-ice-cream.jpg" },
        { name: "Brownie con Helado", description: "Brownie caliente con helado.", price: "$4.99", image: "brownie.jpg" },
        { name: "Pastel de Queso", description: "Clásico y cremoso.", price: "$3.99", image: "cheesecake.jpg" },
        { name: "Galletas con Chocolate", description: "Recién horneadas.", price: "$2.49", image: "cookies.jpg" },
        { name: "Batido de Fresa", description: "Fresco y dulce.", price: "$3.49", image: "strawberry-shake.jpg" },
      ],
    },
  ];

  return (
    <section id="menu">
      <h2>Menú</h2>
      {menuItems.map((category) => (
        <div key={category.category}>
          <h3>{category.category}</h3>
          <div className="menu-grid">
            {category.items.map((item) => (
              <div className="menu-card" key={item.name}>
                <img src={`/assets/${item.image}`} alt={item.name} className="menu-image" />
                <div className="menu-divider"></div> {/* Barra roja */}
                <h4>{item.name}</h4>
                <p>{item.description}</p>
                <p className="menu-price">{item.price}</p>
              </div>
            ))}
          </div>
        </div>
      ))}
    </section>
  );
}

export default Menu;