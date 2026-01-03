import { GET } from "@/app/api/healthz/route";

describe("GET /api/healthz", () => {
  it("should return 200 and ok:true", async () => {
    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toHaveProperty("ok");
    expect(typeof data.ok).toBe("boolean");
  });

  it("should return JSON content-type", async () => {
    const response = await GET();
    const contentType = response.headers.get("content-type");

    expect(contentType).toContain("application/json");
  });
});
