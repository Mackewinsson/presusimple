import {
  formatAdminDateTime,
  formatAdminRelative,
  getUserJoinedAt,
} from "@/lib/admin/user-dates";

describe("user-dates", () => {
  it("derives joined date from ObjectId when createdAt is missing", () => {
    const id = "507f1f77bcf86cd799439011";
    const joined = getUserJoinedAt({ _id: id });
    expect(joined).toBeInstanceOf(Date);
    expect(joined!.getTime()).toBe(
      new Date(parseInt(id.substring(0, 8), 16) * 1000).getTime()
    );
  });

  it("prefers createdAt over ObjectId", () => {
    const createdAt = new Date("2024-06-01T12:00:00Z");
    const joined = getUserJoinedAt({
      _id: "507f1f77bcf86cd799439011",
      createdAt,
    });
    expect(joined?.toISOString()).toBe(createdAt.toISOString());
  });

  it("formats admin date/time and relative labels", () => {
    expect(formatAdminDateTime(null)).toBe("—");
    expect(formatAdminRelative(null)).toBe("Never");

    const today = new Date();
    expect(formatAdminRelative(today)).toBe("Today");
  });
});
