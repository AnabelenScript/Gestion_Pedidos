# Evaluación OSIMM Propuesta

**Nivel general OSIMM: 4.1 / 7**

El sistema cumple sólidamente con Nivel 4 (Servicios), porque tiene servicios independientes, contratos explícitos, comunicación REST, bases de datos separadas y seguridad uniforme. Además, alcanza parcialmente el Nivel 5 (Servicios Compuestos), porque el proceso de negocio principal se compone mediante una Saga orquestada.

| Dimensión OSIMM | Nivel estimado | Evidencia | Brecha | Acción |
|---|---|---|---|---|
| **Negocio** | 4 | El dominio se divide en capacidades claras: pedidos, inventario y pagos | Falta modelar métricas de negocio | Agregar KPIs como pedidos confirmados, pagos rechazados y stock reservado |
| **Organización y gobierno** | 4 | Hay contratos OpenAPI, PRs, ramas y endpoints versionados bajo `/v1` | Falta una política de compatibilidad y retiro de versiones | Definir la estrategia de deprecación para versiones futuras |
| **Métodos** | 4 | Cada servicio tiene DTOs, validación, Swagger y pruebas separadas | Falta automatizar pruebas en CI/CD | Agregar GitHub Actions |
| **Aplicaciones** | 4 | Servicios NestJS independientes con bases de datos separadas | Falta resiliencia avanzada | Agregar retries, timeouts y circuit breakers |
| **Arquitectura** | 5 (parcial) | Existe composición de servicios mediante Saga orquestada | No hay motor BPM externo ni monitoreo avanzado | Documentar estados de la Saga y agregar logs correlacionados |
| **Información** | 4 | Cada servicio administra sus propios datos sin acceso cruzado | Falta catálogo de eventos | Documentar eventos Redis con payloads y versiones |
| **Infraestructura** | 4 | Docker Compose levanta servicios, Redis y bases de datos | Falta despliegue productivo real | Desplegar en Render, Railway, AWS, Azure o similar |

## Brechas principales y Plan de Acción
1. **Falta CI/CD**: Agregar GitHub Actions para test y build.
2. **Versionado formal implementado**: Los contratos HTTP usan el prefijo `/v1`; queda pendiente definir la política de deprecación.
3. **Redis Pub/Sub no persiste**: Evaluar Redis Streams o Kafka para producción.
4. **Falta observabilidad**: Agregar correlation IDs y logs estructurados.
5. **Seguridad Parcial**: Propagar JWT o usar API keys internas.
