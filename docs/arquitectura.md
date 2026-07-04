# Arquitectura de Gestión de Pedidos

## 1. Servicios Reales y Responsabilidades

| Servicio | Responsabilidad exclusiva | Base de datos propia | ¿Es servicio real? |
|---|---|---|---|
| **Orders Service** | Crear pedidos, coordinar la Saga, mantener estado del pedido y publicar eventos | `orders_db` | Sí |
| **Inventory Service** | Consultar stock, reservar productos, confirmar o liberar reservas | `inventory_db` | Sí |
| **Payments Service** | Autorizar pagos, cancelar pagos y consultar transacciones | `payments_db` | Sí |

### Funciones internas, no servicios (Lógica local)
- Validar DTOs
- Calcular total del pedido
- Generar `orderId`
- Verificar existencia de SKU
- Validar monto de pago
- Manejar JWT con Guards

## 2. Flujo Saga Propuesto (Orquestación)

El flujo se controla mediante **Orquestación**, con `Orders Service` manejando la transacción completa.

### Caso de falla con compensación
Escenario: el inventario sí se reservó, pero el pago falla.

| Falla | Acción compensatoria |
|---|---|
| Falla el pago después de reservar inventario | Liberar reserva de inventario |
| Falla la confirmación del pedido después del pago | Cancelar pago y liberar inventario |
| Pedido cancelado | Publicar `order.cancelled` y liberar reserva |

## 3. Contratos OpenAPI Resumidos

### Orders Service (`http://localhost:3000`)
*(Endpoints protegidos con JWT)*
* `POST /orders`: Crear pedido y ejecutar Saga
* `GET /orders/{orderId}`: Consultar pedido
* `POST /orders/{orderId}/cancel`: Cancelar pedido

### Inventory Service (`http://localhost:3001`)
* `GET /inventory/{sku}`: Consultar stock disponible
* `POST /reservations`: Crear reserva de inventario
* `POST /reservations/{reservationId}/confirm`: Confirmar reserva
* `DELETE /reservations/{reservationId}`: Liberar reserva

### Payments Service (`http://localhost:3002`)
* `POST /payments/authorize`: Autorizar pago
* `POST /payments/{paymentId}/void`: Cancelar pago autorizado
* `GET /payments/{paymentId}`: Consultar pago

## 4. Eventos Redis

### Evento principal: `order.confirmed`
- **Publicado por**: Orders Service
- **Consumido por**: Inventory Service
- **Propósito**: Confirmar la reserva y descontar stock.

### Evento de compensación: `order.cancelled`
- **Propósito**: Liberar la reserva en caso de cancelación o fallo en la Saga.

## 5. Seguridad JWT
* **Orders Service**: JWT obligatorio. Ejemplo header: `Authorization: Bearer <jwt>`.
* **Inventory & Payments Service**: Pueden recibir llamadas internas desde Orders.
