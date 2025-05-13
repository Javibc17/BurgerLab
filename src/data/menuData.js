import ensaladaImage from "../assets/ensalada.png";
import nachosImage from "../assets/nachos-removebg-preview.png";
import alitasImage from "../assets/alitas-removebg-preview.png";
import burgerLabImage from "../assets/burgeralbblanconegro-removebg-preview.png";
import fusionTropicalImage from "../assets/fusionTropical-removebg-preview.png";
import locuraImage from "../assets/hamburguesa1-removebg-preview.png";
import bestiaNuclearImage from "../assets/bestianuclear-removebg-preview.png";
import laFumataImage from "../assets/lafumata-removebg-preview.png";
import laMutanteImage from "../assets/lamutante-removebg-preview.png";
import tartaQuesoImage from "../assets/tartaqueso-removebg-preview.png";
import tartaPanteraRosaImage from "../assets/pantera_rosa-removebg-preview.png";
import tartaPistachoImage from "../assets/pistacho.png";
import tartaDelDiaImage from "../assets/tartadeldia.png";

export const menu = {
  entrantes: [
    {
      image: "https://cdn-icons-png.flaticon.com/512/1046/1046786.png",
      title: "Patatas",
      price: "3,00 €",
    },
    { image: ensaladaImage, title: "Ensalada", price: "4,50 €" },
    { image: nachosImage, title: "Nachos", price: "5,00 €" },
    { image: alitasImage, title: "Alitas de Pollo", price: "6,50 €" },
  ],
  hamburguesas: [
    { image: burgerLabImage, title: "BurgerLab", price: "8,50 €" },
    { image: fusionTropicalImage, title: "Fusión Tropical", price: "9,00 €" },
    { image: locuraImage, title: "Locura²", price: "9,50 €" },
    { image: bestiaNuclearImage, title: "Triple Nuclear", price: "10,00 €" },
    { image: laFumataImage, title: "La Fumata", price: "10,50 €" },
    { image: laMutanteImage, title: "La Mutante", price: "12,00 €" },
  ],
  postres: [
    { image: tartaQuesoImage, title: "Tarta de Queso", price: "4,00 €" },
    {
      image: tartaPanteraRosaImage,
      title: "Tarta de Pantera Rosa",
      price: "4,00 €",
    },
    { image: tartaPistachoImage, title: "Tarta de Pistacho", price: "4,00 €" },
    { image: tartaDelDiaImage, title: "Tarta del Día", price: "4,00 €" },
  ],
};
