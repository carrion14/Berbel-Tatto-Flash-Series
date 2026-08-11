# Berbel Tattoo Flash Series

Web de catálogo y reservas de Berbel Tattoo.

## Funciones principales

- Catálogo dinámico con diseños y categorías administrables.
- Inventario y precios sincronizados con Firebase.
- Reservas mediante un mensaje preparado para Instagram.
- Ruleta persistente: cada premio queda vinculado a la cuenta de Google.
- Sistema de Jimmy Coins.
- Panel privado para crear, editar y eliminar diseños, subir imágenes, gestionar categorías, configurar ruletas, precios, reservas, cuentas y vídeos.

## Archivos principales

- `index.html`: web pública.
- `admin.html`: panel de administración.
- `firestore.rules`: permisos de seguridad de Firebase.

Las reglas de Firestore y Storage deben publicarse en el proyecto Firebase antes de usar los editores en producción:

```bash
firebase deploy --only firestore:rules,storage
```

La primera apertura del panel migra automáticamente los 24 diseños originales al catálogo dinámico.
