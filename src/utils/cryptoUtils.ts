
/**
 * Utilities for encrypting and decrypting votes
 */

import CryptoJS from 'crypto-js';

// This key should be stored securely on the server
// For demo purposes, we're using a key from the .env file
const ENCRYPTION_KEY = import.meta.env.VITE_ENCRYPTION_KEY || 'this-is-a-32-char-key-for-encryption';

/**
 * Encrypts a vote for secure transmission to the backend
 * @param voteData The vote data to encrypt (usually contains candidateId and electionId)
 * @returns Encrypted vote string
 */
export const encryptVote = (voteData: any): string => {
  try {
    const jsonString = JSON.stringify(voteData);
    return CryptoJS.AES.encrypt(jsonString, ENCRYPTION_KEY).toString();
  } catch (error) {
    console.error('Error encrypting vote:', error);
    throw new Error('Failed to encrypt vote');
  }
};

/**
 * Decrypts an encrypted vote (server-side only)
 * @param encryptedVote The encrypted vote string
 * @returns Decrypted vote data
 */
export const decryptVote = (encryptedVote: string): any => {
  try {
    const bytes = CryptoJS.AES.decrypt(encryptedVote, ENCRYPTION_KEY);
    const decryptedData = bytes.toString(CryptoJS.enc.Utf8);
    return JSON.parse(decryptedData);
  } catch (error) {
    console.error('Error decrypting vote:', error);
    throw new Error('Failed to decrypt vote');
  }
};

/**
 * This function would be used on the backend to verify and count votes
 * It decrypts the votes and counts them
 */
export const processBallots = (encryptedBallots: string[]): Record<string, number> => {
  const voteCount: Record<string, number> = {};
  
  encryptedBallots.forEach(ballot => {
    try {
      const decryptedVote = decryptVote(ballot);
      const candidateId = decryptedVote.candidateId;
      
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
