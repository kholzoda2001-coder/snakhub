// Categories wholesale accounts should never see or be able to order — imported
// rarities are retail-only for now. Shared between client-side display
// filtering and the server-side checkout guard, so both stay in sync.
export const WHOLESALE_HIDDEN_CATEGORIES = ['rare'];
