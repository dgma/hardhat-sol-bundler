export const Hooks = {
  BEFORE_CONTEXT_INITIALIZATION: "BEFORE_CONTEXT_INITIALIZATION",
  BEFORE_DEPLOYMENT: "BEFORE_DEPLOYMENT",
  BEFORE_DEPENDENCY_RESOLUTION: "BEFORE_DEPENDENCY_RESOLUTION",
  BEFORE_CONTRACT_BUILD: "BEFORE_CONTRACT_BUILD",
  BEFORE_CONTRACT_DEPLOY: "BEFORE_CONTRACT_DEPLOY",
  AFTER_DEPLOYMENT: "AFTER_DEPLOYMENT",
  AFTER_CONTRACT_BUILD: "AFTER_CONTRACT_BUILD",
  AFTER_CONTEXT_SERIALIZATION: "AFTER_CONTEXT_SERIALIZATION",
  AFTER_CONTRACT_DEPLOY: "AFTER_CONTRACT_DEPLOY",
} as const;
