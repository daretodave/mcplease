import { fireEvent, render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { SlugField } from "./slug-field";

describe("SlugField", () => {
  it("shows the idle hint and no claim while the field is empty", () => {
    // even with a status set, an empty field has nothing to judge yet
    const { getByText, queryByText } = render(
      <SlugField value="" status="available" onChange={() => {}} />,
    );
    expect(getByText(/mint a friendly one/)).toBeInTheDocument();
    expect(queryByText("available")).toBeNull();
  });

  it("announces an available slug in the affirmative, emphasized", () => {
    const { getByText } = render(
      <SlugField value="my-server" status="available" onChange={() => {}} />,
    );
    expect(getByText("available").tagName.toLowerCase()).toBe("strong");
    expect(getByText(/yours/)).toBeInTheDocument();
  });

  it("flags a taken slug and nudges to try another", () => {
    const { getByText } = render(
      <SlugField value="taken-one" status="taken" onChange={() => {}} />,
    );
    expect(getByText("taken").tagName.toLowerCase()).toBe("strong");
    expect(getByText(/try another/)).toBeInTheDocument();
  });

  it("spells out the format rules when the slug is invalid", () => {
    const { getByText } = render(<SlugField value="No__pe" status="invalid" onChange={() => {}} />);
    expect(getByText(/letters, numbers and dashes/)).toBeInTheDocument();
  });

  it("lowercases the visitor's keystrokes before handing them up", () => {
    const onChange = vi.fn();
    const { getByRole } = render(<SlugField value="" status="idle" onChange={onChange} />);
    fireEvent.change(getByRole("textbox"), { target: { value: "MyServer" } });
    expect(onChange).toHaveBeenCalledWith("myserver");
  });
});
