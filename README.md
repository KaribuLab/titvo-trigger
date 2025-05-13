# Titvo Trigger

Servicio de desencadenamiento de escaneos de seguridad para repositorios de código fuente desde múltiples orígenes (CLI, GitHub, Bitbucket).

## Descripción

Titvo Trigger es un servicio construido con NestJS que permite iniciar análisis de seguridad de código fuente. Soporta diferentes fuentes de código como línea de comandos (CLI), GitHub y Bitbucket. El servicio se encarga de validar los parámetros de entrada según la fuente, procesar la información del repositorio y programar el trabajo de análisis de seguridad en AWS Batch.

## Características

- Arquitectura modular con NestJS
- Soporte para múltiples fuentes de código:
  - CLI (Command Line Interface)
  - GitHub
  - Bitbucket
- Integración con servicios AWS:
  - AWS Batch para la ejecución de trabajos de análisis
  - AWS Parameter Store para configuración
  - AWS Secrets Manager para gestión de secretos
- Validación de API Keys
- Manejo robusto de errores
- Estrategias de reintento para operaciones críticas

## Estructura

El proyecto utiliza un patrón de estrategia para manejar diferentes fuentes de código:

- `CliStrategy`: Procesa tareas desde la línea de comandos
- `GithubStrategy`: Procesa tareas desde GitHub
- `BitbucketStrategy`: Procesa tareas desde Bitbucket

Cada estrategia implementa la interfaz `ScmStrategy` (Source Code Management) y se encarga de validar y transformar los argumentos específicos de su fuente.

## Instalación

```bash
npm install
```

## Uso

Para iniciar un análisis de seguridad, envía una solicitud con la fuente de código y los argumentos específicos requeridos para esa fuente:

### CLI

```json
{
  "source": "CLI",
  "apiKey": "tu-api-key",
  "args": {
    "batch_id": "id-del-lote",
    "repository_url": "git@github.com:usuario/repo.git"
  }
}
```

### GitHub

```json
{
  "source": "GITHUB",
  "apiKey": "tu-api-key",
  "args": {
    "github_token": "token-de-github",
    "github_repo_name": "usuario/repo",
    "github_commit_sha": "hash-del-commit",
    "github_assignee": "nombre-de-usuario"
  }
}
```

### Bitbucket

```json
{
  "source": "BITBUCKET",
  "apiKey": "tu-api-key",
  "args": {
    "bitbucket_commit": "hash-del-commit",
    "bitbucket_workspace": "nombre-del-espacio",
    "bitbucket_repo_slug": "nombre-del-repo",
    "bitbucket_project_key": "clave-del-proyecto"
  }
}
```

## Licencia

[Apache License 2.0](LICENSE) 