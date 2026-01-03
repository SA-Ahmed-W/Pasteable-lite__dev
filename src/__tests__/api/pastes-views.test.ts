import { POST } from "@/app/api/pastes/route";
import { GET } from "@/app/api/pastes/[id]/route";
import { createMockRequest } from "../utils/test-helpers";

describe("View Counting", () => {
  it("should enforce max_views = 1", async () => {
    // Create paste
    const createReq = createMockRequest("http://localhost:3000/api/pastes", {
      method: "POST",
      body: {
        content: "Single View Test",
        max_views: 1,
      },
    });

    const createRes = await POST(createReq);
    const { id } = await createRes.json();

    // First fetch - should succeed
    const req1 = createMockRequest(`http://localhost:3000/api/pastes/${id}`);
    const res1 = await GET(req1, { params: { id } });
    const data1 = await res1.json();

    expect(res1.status).toBe(200);
    expect(data1.remaining_views).toBe(0);

    // Second fetch - should fail
    const req2 = createMockRequest(`http://localhost:3000/api/pastes/${id}`);
    const res2 = await GET(req2, { params: { id } });

    expect(res2.status).toBe(404);
  });

  it("should enforce max_views = 2", async () => {
    // Create paste
    const createReq = createMockRequest("http://localhost:3000/api/pastes", {
      method: "POST",
      body: {
        content: "Two Views Test",
        max_views: 2,
      },
    });

    const createRes = await POST(createReq);
    const { id } = await createRes.json();

    // First fetch
    const req1 = createMockRequest(`http://localhost:3000/api/pastes/${id}`);
    const res1 = await GET(req1, { params: { id } });
    const data1 = await res1.json();

    expect(res1.status).toBe(200);
    expect(data1.remaining_views).toBe(1);

    // Second fetch
    const req2 = createMockRequest(`http://localhost:3000/api/pastes/${id}`);
    const res2 = await GET(req2, { params: { id } });
    const data2 = await res2.json();

    expect(res2.status).toBe(200);
    expect(data2.remaining_views).toBe(0);

    // Third fetch - should fail
    const req3 = createMockRequest(`http://localhost:3000/api/pastes/${id}`);
    const res3 = await GET(req3, { params: { id } });

    expect(res3.status).toBe(404);
  });
});
