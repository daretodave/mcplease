import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ConnectedCap } from "./connected-cap";

describe("ConnectedCap", () => {
  it("shows the given finish-line label", () => {
    const { getByText } = render(<ConnectedCap label="Connected in Cursor." />);
    expect(getByText("Connected in Cursor.")).toBeInTheDocument();
  });

  it("falls back to a default label", () => {
    const { getByText } = render(<ConnectedCap />);
    expect(getByText(/you’re all set/)).toBeInTheDocument();
  });
});
