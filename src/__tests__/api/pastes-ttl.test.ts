import { POST } from "@/app/api/pastes/route";
import { GET } from "@/app/api/pastes/[id]/route";
import { createMockRequest } from "../utils/test-helpers";

describe("TTL Expiry with TEST_MODE", () => {
  let pasteId: string;
  let createdAt: number;

  beforeAll(async () => {
    // Create paste with 60s TTL
    const createReq = createMockRequest("http://localhost:3000/api/pastes", {
      method: "POST",
      body: {
        content: "TTL Test",
        ttl_seconds: 60,
      },
    });

    const createRes = await POST(createReq);
    const createData = await createRes.json();
    pasteId = createData.id;
    createdAt = Date.now();
  });

  it("should return paste before expiry (TEST_MODE)", async () => {
    const nowMs = createdAt + 30000; // 30 seconds after creation

    const req = createMockRequest(
      `http://localhost:3000/api/pastes/${pasteId}`,
      {
        headers: {
          "x-test-now-ms": nowMs.toString(),
        },
      }
    );

    const response = await GET(req, { params: { id: pasteId } });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toHaveProperty("content", "TTL Test");
    expect(data.expires_at).not.toBeNull();
  });

  it("should return 404 after expiry (TEST_MODE)", async () => {
    const nowMs = createdAt + 61000; // 61 seconds after creation

    const req = createMockRequest(
      `http://localhost:3000/api/pastes/${pasteId}`,
      {
        headers: {
          "x-test-now-ms": nowMs.toString(),
        },
      }
    );

    const response = await GET(req, { params: { id: pasteId } });
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data).toHaveProperty("error");
  });
});
