function requiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const env = {
  web: {
    client_id: requiredEnv("EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID"),
  },
  location: {
    location_iq: requiredEnv("EXPO_PUBLIC_LOCATIONIQ_API_TOKEN"),
  },
};
