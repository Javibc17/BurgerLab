import React from "react";

const MenuItem = ({ image, title, price }) => (
  <div className="menu-item">
    <img src={image} alt={title} className="menu-item-image" />
    <div className="menu-item-info">
      <h4>{title}</h4>
    </div>
    <span className="menu-item-price">{price}</span>
  </div>
);

export default MenuItem;
