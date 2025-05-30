import React from "react";
import MenuItem from "./MenuItem";

function MenuCategory({ title, items, id, onProductClick }) {
  const extraDescriptions = {
    entrantes: [
      "Clásicas patatas fritas doradas.",
      "Ensalada fresca con ingredientes de temporada.",
      "Nachos crujientes con queso y salsas.",
      "Alitas de pollo marinadas y crujientes."
    ],
    postres: [
      "Tarta cremosa de queso con base de galleta.",
      "Bizcocho rosa relleno de crema, sabor a infancia.",
      "Tarta de pistacho suave y deliciosa.",
      "Tarta casera del día, pregúntanos por el sabor!"
    ]
  };
  const isEntrantes = id === 'entrantes';
  const isPostres = id === 'postres';
  return (
    <section className="menu-category" id={id}>
      <h3 className="category-title">{title}</h3>
      <div className="menu-items-container">
        {items.map((item, index) => {
          return (
            <div key={index} onClick={() => onProductClick && onProductClick({
              ...item,
              categoria: isEntrantes ? 'entrantes' : isPostres ? 'postres' : 'hamburguesas',
              description: item.description || (isEntrantes ? extraDescriptions.entrantes[index] : isPostres ? extraDescriptions.postres[index] : undefined)
            })} style={{ cursor: 'pointer' }}>
              <MenuItem
                image={item.image}
                title={item.title}
                price={item.price}
              />
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default MenuCategory;
