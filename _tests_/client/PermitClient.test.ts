import { PermitClient } from '../../src/client/PermitClient';
import { IPermitConfig } from '../../src/types/IPermitConfig';
import { Permit } from 'permitio';

// Mock the Permit SDK
jest.mock('permitio', () => {
  return {
    Permit: jest.fn().mockImplementation(() => ({
      check: jest.fn().mockResolvedValue(true),
      api: {
        tenants: {
          list: jest.fn().mockResolvedValue([{ key: 'default' }])
        },
        resourceInstances: {
          create: jest.fn().mockResolvedValue({ id: '123' }),
          update: jest.fn().mockResolvedValue({ id: '123' }),
          delete: jest.fn().mockResolvedValue(true)
        }
      },
      getUserPermissions: jest.fn().mockResolvedValue({
        'document:1': { permissions: ['document:read'] },
        'document:2': { permissions: ['document:read'] }
      })
    }))
  };
});

describe('PermitClient', () => {
  let client: PermitClient;
  let mockConfig: IPermitConfig;

  beforeEach(() => {
    mockConfig = {
      token: 'test-token',
      pdp: 'http://localhost:7000',
      debug: false,
      throwOnError: true
    };
    client = new PermitClient(mockConfig);
  });

  describe('initialization', () => {
    it('should instantiate Permit SDK with correct config', () => {
      expect(Permit).toHaveBeenCalledWith({
        token: 'test-token',
        pdp: 'http://localhost:7000',
        apiUrl: undefined,
        log: undefined,
        throwOnError: true
      });
    });
  });

  describe('check', () => {
    it('should call Permit SDK check with correct params', async () => {
      const permitInstance = (client as any).permitInstance;
      const result = await client.check('user1', 'read', 'document');
      
      expect(permitInstance.check).toHaveBeenCalledWith(
        'user1', 'read', 'document', undefined
      );
      expect(result).toBe(true);
    });
  });

  describe('getAllowedResourceIds', () => {
    it('should extract allowed resource IDs from permissions', async () => {
      const ids = await client.getAllowedResourceIds('user1', 'document', 'read');
      
      expect(ids).toEqual(['1', '2']);
    });
  });

  describe('syncResourceInstanceCreate', () => {
    it('should call resource instance create API with correct params', async () => {
      const permitInstance = (client as any).permitInstance;
      
      await client.syncResourceInstanceCreate('document', '123', 'test-tenant', { title: 'Test' });
      
      expect(permitInstance.api.resourceInstances.create).toHaveBeenCalledWith({
        resource: 'document',
        key: '123',
        tenant: 'test-tenant',
        attributes: { title: 'Test' }
      });
    });
  });
});