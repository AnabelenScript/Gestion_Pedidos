const REQUIRED_VARIABLES = [
  'DATABASE_HOST',
  'DATABASE_USER',
  'DATABASE_PASS',
  'DATABASE_NAME',
  'INTERNAL_API_KEY',
] as const;

function requiredText(config: Record<string, unknown>, key: string): string {
  const value = config[key];
  if (typeof value !== 'string' || value.trim() === '') {
    throw new Error(`La variable ${key} es obligatoria`);
  }
  return value.trim();
}

function integer(value: unknown, key: string, fallback: number): number {
  const parsed = Number(value ?? fallback);
  if (!Number.isInteger(parsed) || parsed < 1 || parsed > 65535) {
    throw new Error(`La variable ${key} debe ser un puerto válido`);
  }
  return parsed;
}

function boolean(value: unknown, key: string, fallback: boolean): boolean {
  if (value === undefined) return fallback;
  if (value === true || value === 'true') return true;
  if (value === false || value === 'false') return false;
  throw new Error(`La variable ${key} debe ser true o false`);
}

export function validateEnvironment(config: Record<string, unknown>) {
  const validated = { ...config };
  for (const key of REQUIRED_VARIABLES) {
    validated[key] = requiredText(config, key);
  }

  if ((validated.INTERNAL_API_KEY as string).length < 32) {
    throw new Error('INTERNAL_API_KEY debe contener al menos 32 caracteres');
  }

  validated.PORT = integer(config.PORT, 'PORT', 3002);
  validated.DATABASE_PORT = integer(
    config.DATABASE_PORT,
    'DATABASE_PORT',
    5432,
  );
  validated.DATABASE_SSL = boolean(config.DATABASE_SSL, 'DATABASE_SSL', false);
  validated.DATABASE_SSL_REJECT_UNAUTHORIZED = boolean(
    config.DATABASE_SSL_REJECT_UNAUTHORIZED,
    'DATABASE_SSL_REJECT_UNAUTHORIZED',
    true,
  );
  validated.DATABASE_SYNCHRONIZE = boolean(
    config.DATABASE_SYNCHRONIZE,
    'DATABASE_SYNCHRONIZE',
    false,
  );
  validated.DATABASE_RUN_MIGRATIONS = boolean(
    config.DATABASE_RUN_MIGRATIONS,
    'DATABASE_RUN_MIGRATIONS',
    false,
  );

  return validated;
}
