import { MockPermitClient } from './MockPermitClient';
import { PermitError } from '../../src/utils/error';

describe('MockPermitClient', () => {
  let mockClient: MockPermitClient;

  beforeEach(() => {
    mockClient = new MockPermitClient({ 
      allowedActions: ['document:read'] 
    });
  });

  describe('check', () => {
    it('should allow permitted actions', async () => {
      const result = await mockClient.check('user1', 'read', 'document');
      expect(result).toBe(true);
    });

    it('should deny non-permitted actions', async () => {
      const result = await mockClient.check('user1', 'write', 'document');
      expect(result).toBe(false);
    });

    it('should record call history', async () => {
      await mockClient.check('user1', 'read', 'document');
      expect(mockClient.callHistory.length).toBe(1);
      expect(mockClient.callHistory[0].user).toBe('user1');
      expect(mockClient.callHistory[0].action).toBe('read');
      expect(mockClient.callHistory[0].resource).toBe('document');
    });

    it('should work with resource objects', async () => {
      mockClient.allowAction('posts', 'read');
      const result = await mockClient.check(
        'user1', 
        'read', 
        { type: 'posts', key: '123' }
      );
      expect(result).toBe(true);
    });
  });

  describe('enforceCheck', () => {
    it('should not throw for permitted actions', async () => {
      await expect(mockClient.enforceCheck(
        'user1', 'read', 'document'
      )).resolves.not.toThrow();
    });

    it('should throw PermitError for non-permitted actions', async () => {
      await expect(mockClient.enforceCheck(
        'user1', 'write', 'document'
      )).rejects.toThrow(PermitError);
    });
  });

  describe('configuration', () => {
    it('should allow setting allowed actions after construction', async () => {
      mockClient.setAllowedActions(['file:write']);
      
      expect(await mockClient.check('user1', 'read', 'document')).toBe(false);
      expect(await mockClient.check('user1', 'write', 'file')).toBe(true);
    });

    it('should allow adding individual actions', async () => {
      mockClient.allowAction('image', 'upload');
      
      expect(await mockClient.check('user1', 'upload', 'image')).toBe(true);
    });
  });
});