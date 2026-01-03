import { POST } from '@/app/api/pastes/route';
import { createMockRequest } from '../utils/test-helpers';

describe('POST /api/pastes', () => {
  it('should create a paste successfully', async () => {
    const req = createMockRequest('http://localhost:3000/api/pastes', {
      method: 'POST',
      body: {
        content: 'Hello World',
      },
    });

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data).toHaveProperty('id');
    expect(data).toHaveProperty('url');
    expect(data.url).toContain(`/p/${data.id}`);
  });

  it('should create paste with ttl_seconds', async () => {
    const req = createMockRequest('http://localhost:3000/api/pastes', {
      method: 'POST',
      body: {
        content: 'TTL Test',
        ttl_seconds: 60,
      },
    });

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data).toHaveProperty('id');
  });

  it('should create paste with max_views', async () => {
    const req = createMockRequest('http://localhost:3000/api/pastes', {
      method: 'POST',
      body: {
        content: 'Views Test',
        max_views: 5,
      },
    });

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data).toHaveProperty('id');
  });

  it('should reject empty content', async () => {
    const req = createMockRequest('http://localhost:3000/api/pastes', {
      method: 'POST',
      body: {
        content: '',
      },
    });

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data).toHaveProperty('error');
  });

  it('should reject invalid ttl_seconds', async () => {
    const req = createMockRequest('http://localhost:3000/api/pastes', {
      method: 'POST',
      body: {
        content: 'Test',
        ttl_seconds: 0,
      },
    });

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data).toHaveProperty('error');
  });

  it('should reject invalid max_views', async () => {
    const req = createMockRequest('http://localhost:3000/api/pastes', {
      method: 'POST',
      body: {
        content: 'Test',
        max_views: -1,
      },
    });

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data).toHaveProperty('error');
  });
});
