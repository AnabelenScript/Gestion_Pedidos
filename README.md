# Gestión de Pedidos - Order Management Platform

Plataforma de gestión de pedidos basada en microservicios, utilizando Node.js (NestJS), PostgreSQL, Redis y un patrón de diseño Saga (Orquestado) para mantener la consistencia distribuida.

## Servicios

* **Orders Service (Orquestador)**: Crea pedidos, coordina la Saga, mantiene el estado del pedido y publica eventos.
* **Inventory Service**: Consulta stock, reserva productos, confirma o libera reservas.
* **Payments Service**: Autoriza pagos, cancela pagos y consulta transacciones.

## Arquitectura

Consulta la documentación completa en la carpeta `docs/`:

* [Arquitectura, OpenAPI y Eventos](docs/arquitectura.md)
* [Evaluación OSIMM](docs/osimm-evaluacion.md)

## Ejecutar localmente

Primero crea el archivo local de configuración y reemplaza todos los valores de ejemplo:

```powershell
Copy-Item .env.example .env
```

`JWT_SECRET` e `INTERNAL_API_KEY` deben tener al menos 32 caracteres. Las credenciales que estuvieron versionadas anteriormente deben rotarse en el proveedor de base de datos antes de volver a utilizarse.

```bash
docker-compose up --build
```

El endpoint `POST /v1/auth/login` sólo está disponible cuando `ENABLE_DEV_AUTH=true`. Los endpoints de Inventory y Payments requieren el header `x-internal-api-key`; Orders lo agrega automáticamente en sus llamadas internas.
