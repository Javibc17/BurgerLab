# BurgerLab Backend

## Instalación

1. Entra en la carpeta backend:
   ```sh
   cd backend
   ```
2. Instala las dependencias:
   ```sh
   npm install
   ```
3. Asegúrate de tener MongoDB corriendo localmente (o cambia la variable `MONGO_URI` en `.env` si usas MongoDB Atlas).
4. Arranca el servidor:
   ```sh
   npm run dev
   ```

## Endpoints
- `POST /api/tickets` — Guarda un pedido/ticket (body: igual que el ticket de tu frontend)
- `GET /api/tickets` — Lista todos los tickets

