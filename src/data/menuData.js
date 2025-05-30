import ensaladaImage from "../assets/entrantes/ensalada.png";
import nachosImage from "../assets/entrantes/nachos-removebg-preview.png";
import alitasImage from "../assets/entrantes/alitas-removebg-preview.png";
import burgerLabImage from "../assets/hamburguesas/burgeralbblanconegro-removebg-preview.png";
import fusionTropicalImage from "../assets/hamburguesas/fusionTropical-removebg-preview.png";
import fusionTropicalRealImage from "../assets/hamburguesasReal/FusionTropicalReal.png";
import locuraImage from "../assets/hamburguesas/hamburguesa1-removebg-preview.png";
import locuraRealImage from "../assets/hamburguesasReal/LocuraReal.png";
import bestiaNuclearImage from "../assets/hamburguesas/bestianuclear-removebg-preview.png";
import tripleNuclearRealImage from "../assets/hamburguesasReal/TripleNuclearReal.png";
import laFumataImage from "../assets/hamburguesas/lafumata-removebg-preview.png";
import laFumataRealImage from "../assets/hamburguesasReal/LaFumataReal.png";
import laMutanteImage from "../assets/hamburguesas/lamutante-removebg-preview.png";
import laMutanteRealImage from "../assets/hamburguesasReal/laMutanteReal.png";
import tartaQuesoImage from "../assets/postres/tartaqueso-removebg-preview.png";
import tartaPanteraRosaImage from "../assets/postres/pantera_rosa-removebg-preview.png";
import tartaPistachoImage from "../assets/postres/pistacho.png";
import tartaDelDiaImage from "../assets/postres/tartadeldia.png";

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
    { image: burgerLabImage, title: "BurgerLab", price: "12,50 €" },
    { image: fusionTropicalImage, modalImage: fusionTropicalRealImage, title: "Fusión Tropical", price: "9,00 €", description: `Ingredientes:
Pan brioche tostado, hamburguesa de ternera o pollo, queso provolone, rodaja de piña a la plancha, cebolla caramelizada al ron, salsa de mostaza antigua con miel y rúcula fresca.

Presentación:
Se sirve en plato blanco, pan brioche dorado y piña a la plancha. Acompañada de chips de batata y salsa de mostaza y miel aparte.

Fórmula:
(Brioche² + Carne¹ + Provolone¹) + (Piña🔥 + CebollaRon + MielMust) + Rúcula` },
    { image: locuraImage, modalImage: locuraRealImage, title: "Locura²", price: "9,50 €", description: `Ingredientes:
Doble carne, doble queso, doble placer. Con cebolla caramelizada y salsa especial.

Presentación:
Locura² se sirve en pan clásico, acompañada de patatas fritas y salsa especial en recipiente aparte.

Fórmula:
(Carne x2 + Queso x2) + Cebolla caramelizada + Salsa especial` },
    { image: bestiaNuclearImage, modalImage: tripleNuclearRealImage, title: "Triple Nuclear", price: "10,00 €", description: `Ingredientes:
Triple carne, jalapeños, salsa picante nuclear y queso pepper jack.

Presentación:
Triple Nuclear se sirve en pan especial, acompañada de patatas fritas y salsa nuclear en recipiente aparte.

Fórmula:
(Carne x3 + Jalapeños + Salsa nuclear + Pepper jack) + Pan especial` },
    { image: laFumataImage, modalImage: laFumataRealImage, title: "La Fumata", price: "10,50 €", description: `Ingredientes:
Carne ahumada, queso provolone, cebolla morada, bacon y salsa barbacoa casera.

Presentación:
La Fumata se sirve en pan artesanal con un toque de humo, acompañada de patatas rústicas y salsa barbacoa en recipiente aparte.

Fórmula:
(Carne ahumada + Provolone + Cebolla + Bacon) + Pan artesanal + BBQ` },
    { image: laMutanteImage, modalImage: laMutanteRealImage, title: "La Mutante", price: "12,00 €", description: `Ingredientes:
Carne de vacuno, pulled pork, queso cheddar, huevo frito y salsa mostaza-miel.

Presentación:
La Mutante se sirve en pan especial, acompañada de patatas deluxe y salsa mostaza-miel en recipiente aparte.

Fórmula:
(Carne de vacuno + Pulled pork + Cheddar + Huevo frito) + Pan especial + Mostaza-miel` },
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
