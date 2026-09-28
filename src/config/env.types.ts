export interface EnvironmentVariables {
  NODE_ENV: 'development' | 'test' | 'production';
  PORT: number;

  DATABASE_URL: string;

  EVOLUTION_API_URL: string;
  EVOLUTION_API_KEY: string;
  EVOLUTION_INSTANCE: string;
  EVOLUTION_REQUEST_TIMEOUT: number;
}
