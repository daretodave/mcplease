import { render } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { useAppearance } from "../../stores/appearance";
import { ThemeToggle } from "./theme-toggle";

// Drive the store to a concrete theme before each render so resolveTheme never consults matchMedia
// (absent in jsdom), and reset it afterwards so cases stay isolated.
afterEach(() => {
  useAppearance.setState({ preference: "dark" });
});

describe("ThemeToggle", () => {
  it("on the dark theme, offers to switch to light and shows the moon", () => {
    useAppearance.getState().setPreference("dark");
    const { getByRole, container } = render(<ThemeToggle />);

    expect(getByRole("button", { name: "Switch to light theme" })).toBeInTheDocument();
    // the moon is a lone crescent; only the sun would carry its disc as a <circle>
    expect(container.querySelector("svg circle")).toBeNull();
  });

  it("on the light theme, offers to switch to dark and shows the sun", () => {
    useAppearance.getState().setPreference("light");
    // pass non-default size/variant to confirm they forward without disturbing the contract
    const { getByRole, container } = render(<ThemeToggle size="sm" variant="secondary" />);

    expect(getByRole("button", { name: "Switch to dark theme" })).toBeInTheDocument();
    // the sun's disc renders as a <circle>; the moon has none
    expect(container.querySelector("svg circle")).not.toBeNull();
  });

  it("clicking from dark flips the preference to the concrete light theme", () => {
    useAppearance.getState().setPreference("dark");
    const { getByRole } = render(<ThemeToggle />);

    getByRole("button", { name: "Switch to light theme" }).click();
    expect(useAppearance.getState().preference).toBe("light");
  });

  it("clicking from light flips the preference to the concrete dark theme", () => {
    useAppearance.getState().setPreference("light");
    const { getByRole } = render(<ThemeToggle />);

    getByRole("button", { name: "Switch to dark theme" }).click();
    expect(useAppearance.getState().preference).toBe("dark");
  });

  it("reports the theme it switched to via onChange", () => {
    useAppearance.getState().setPreference("dark");
    let reported: "dark" | "light" | undefined;
    const { getByRole } = render(<ThemeToggle onChange={(t) => (reported = t)} />);

    getByRole("button").click();
    expect(reported).toBe("light");
  });
});
