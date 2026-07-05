# Arquitectura de Gestión de Pedidos

## Diagrama de Arquitectura (Síncrono y Asíncrono)

```mermaid
graph TD
    Client((Cliente REST))

    subgraph Orchestrator [Dominio Órdenes]
        O[Orders Service<br/>Port 3000]
        O_DB[(Orders DB<br/>AWS RDS)]
        O -->|TypeORM| O_DB
    end

    subgraph Inventory [Dominio Inventario]
        I[Inventory Service<br/>Port 3001]
        I_DB[(Inventory DB<br/>AWS RDS)]
        I -->|TypeORM| I_DB
    end

    subgraph Payments [Dominio Pagos]
        P[Payments Service<br/>Port 3002]
        P_DB[(Payments DB<br/>AWS RDS)]
        P -->|TypeORM| P_DB
    end

    R((Redis<br/>Pub/Sub))

    Client -->|1. POST /v1/orders| O
    
    O -->|2. POST /v1/reservations (REST)| I
    O -->|3. POST /v1/payments/authorize (REST)| P
    O -->|4. POST /v1/reservations/:id/confirm (REST)| I

    O -.->|5. Pub: 'order.confirmed' (Async)| R
    O -.->|Compensación: 'order.cancelled'| R
    R -.->|Sub: Escucha eventos| I

    classDef default fill:#f9f9f9,stroke:#333,stroke-width:2px;
    
    linkStyle 1,2,3,4 stroke:#0f5132,stroke-width:2px
    linkStyle 5,6,7 stroke:#856404,stroke-width:2px,stroke-dasharray: 5 5
```
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
* `POST /v1/orders`: Crear pedido y ejecutar Saga
* `GET /v1/orders/{orderId}`: Consultar pedido
* `POST /v1/orders/{orderId}/cancel`: Cancelar pedido

### Inventory Service (`http://localhost:3001`)
* `GET /v1/inventory/{sku}`: Consultar stock disponible
* `POST /v1/reservations`: Crear reserva de inventario
* `POST /v1/reservations/{reservationId}/confirm`: Confirmar reserva
* `DELETE /v1/reservations/{reservationId}`: Liberar reserva

### Payments Service (`http://localhost:3002`)
* `POST /v1/payments/authorize`: Autorizar pago
* `POST /v1/payments/{paymentId}/void`: Cancelar pago autorizado
* `GET /v1/payments/{paymentId}`: Consultar pago

## 4. Eventos Redis

### Evento principal: `order.confirmed`
- **Publicado por**: Orders Service
- **Consumido por**: Inventory Service
- **Propósito**: Confirmar la reserva y descontar stock.

### Evento de compensación: `order.cancelled`
- **Propósito**: Liberar la reserva en caso de cancelación o fallo en la Saga.

## 5. Seguridad JWT
* **Orders Service**: JWT obligatorio en todos los endpoints de pedidos. Ejemplo header: `Authorization: Bearer <jwt>`.
* **Inventory & Payments Service**: Sólo aceptan llamadas internas con el header `x-internal-api-key`.
* **Autenticación de desarrollo**: `POST /v1/auth/login` sólo se habilita mediante `ENABLE_DEV_AUTH=true` y no debe exponerse en producción.
