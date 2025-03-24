
/**
 * Utilities for vote processing
 */

/**
 * Process votes and count them
 * This function would be used on the backend to verify and count votes
 */
export const processBallots = (ballots: any[]): Record<string, number> => {
  const voteCount: Record<string, number> = {};
  
  ballots.forEach(ballot => {
    try {
      const candidateId = ballot.candidateId;
      
      if (!voteCount[candidateId]) {
        voteCount[candidateId] = 0;
      }
      
      voteCount[candidateId]++;
    } catch (error) {
      console.error('Error processing ballot:', error);
      // In a real system, invalid ballots would be logged for audit
    }
  });
  
  return voteCount;
};
