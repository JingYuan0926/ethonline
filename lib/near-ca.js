import { setupAdapter as setupNearCaAdapter } from 'near-ca';

export async function setupAdapter(config) {
  try {
    const adapter = await setupNearCaAdapter(config);
    return adapter;
  } catch (error) {
    console.error('Error setting up NEAR-CA adapter:', error);
    throw error;
  }
}