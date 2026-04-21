export function getAppOrigin() {
  return process.env.APP_ORIGIN ?? "http://localhost:3000";
}

export function getRpId() {
  return process.env.RP_ID ?? new URL(getAppOrigin()).hostname;
}

export function getRpName() {
  return process.env.RP_NAME ?? "Article Collector";
}
