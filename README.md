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

```bash
docker-compose up --build
```
