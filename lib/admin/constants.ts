// Shared enum-ish option lists for admin forms — kept in one place so the
// practice-task form (and anything else that references skill categories)
// doesn't duplicate these arrays.

export const SKILL_CATEGORIES = [
  "promptEvaluation",
  "responseRanking",
  "factChecking",
  "safetyReview",
  "annotation",
  "reasoning",
  "reasoningEvaluation",
  "instructionFollowing",
];

// Feeds the readiness score — what kind of mistake a task is designed to
// catch a candidate making.
export const FAILURE_MODE_TAGS = [
  "droppedProhibition",
  "halo",
  "horn",
  "fabricatedCitation",
  "wrongMagnitude",
  "overRefusal",
  "unsupportedClaim",
  "droppedConstraint",
  "drift",
  "forcedFit",
  "overSkip",
  "scaleDrift",
  "boundaryError",
];
