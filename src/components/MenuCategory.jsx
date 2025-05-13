import React from "react";
import MenuItem from "./MenuItem";

function MenuCategory({ title, items, id }) {
  return (
    <section className="menu-category" id={id}>
      <h3 className="category-title">{title}</h3>
      <div className="menu-items-container">
        {items.map((item, index) => (
          <MenuItem
            key={index}
            image={item.image}
            title={item.title} // Cambiado de "item.name" a "item.title"
            price={item.price}
          />
        ))}
      </div>
    </section>
  );
}

export default MenuCategory;
