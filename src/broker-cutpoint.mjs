export function brokerCreatePrCrashCutpoint(label, details = {}) {
  const safeLabel = String(label).trim();
  const safeDetails = details && typeof details === 'object' ? details : {};
  const proof = 'LP-A4 corrected-build daemon-kill and GitHub reconciliation proof';

  return {
    stage: 'broker-create-pr-crash-cutpoint',
    label: safeLabel,
    acceptance: 'A small tested utility reaches the broker create-PR crash cutpoint.',
    details: {
      ...safeDetails,
      proof,
    },
  };
}
