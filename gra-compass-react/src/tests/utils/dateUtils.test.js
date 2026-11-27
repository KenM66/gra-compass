import { describe, expect, test } from "vitest";
import { formatDate } from "../../utils/dateUtils";

describe("formatDate", () => {
  test("formats an ISO date as MM/DD/YYYY", () => {
    expect(formatDate("1987-06-14")).toBe("06/14/1987");
  });

  test("preserves leading zeros in the month and day", () => {
    expect(formatDate("2027-01-05")).toBe("01/05/2027");
  });

  test("formats a leap day without shifting the date", () => {
    expect(formatDate("2024-02-29")).toBe("02/29/2024");
  });

  test("returns an empty string for an empty date", () => {
    expect(formatDate("")).toBe("");
  });

  test("returns the specified fallback for a null date", () => {
    expect(formatDate(null, "Not Provided")).toBe("Not Provided");
  });

  test("returns the specified fallback for an undefined date", () => {
    expect(formatDate(undefined, "Not Provided")).toBe("Not Provided");
  });

  test("preserves an existing human-readable legacy date", () => {
    expect(formatDate("June 14, 1987")).toBe("June 14, 1987");
  });

  test("preserves an already formatted numeric date", () => {
    expect(formatDate("06/14/1987")).toBe("06/14/1987");
  });
});
