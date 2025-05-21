import React from "react";
import MenuItem from "./MenuItem";

function MenuCategory({ title, items, id, onProductClick }) {
  return (
    <section className="menu-category" id={id}>
      <h3 className="category-title">{title}</h3>
      <div className="menu-items-container">
        {items.map((item, index) => (
          <div key={index} onClick={() => onProductClick && onProductClick(item)} style={{ cursor: 'pointer' }}>
            <MenuItem
              image={item.image}
              title={item.title}
              price={item.price}
            />
          </div>
        ))}
      </div>
    </section>
  );
}

export default MenuCategory;
