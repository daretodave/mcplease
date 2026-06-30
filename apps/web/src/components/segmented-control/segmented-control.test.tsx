import { fireEvent, render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { SegmentedControl } from "./segmented-control";

const options = [
  { value: "http", label: "Remote URL" },
  { value: "stdio", label: "Local server" },
];

describe("SegmentedControl", () => {
  it("renders one radio per option inside a labelled radiogroup", () => {
    const { getByRole, getAllByRole } = render(
      <SegmentedControl label="Transport" value="http" onChange={() => {}} options={options} />,
    );
    expect(getByRole("radiogroup", { name: "Transport" })).toBeInTheDocument();
    expect(getAllByRole("radio")).toHaveLength(2);
  });

  it("marks the selected option checked and the rest unchecked", () => {
    const { getByRole } = render(
      <SegmentedControl label="Transport" value="stdio" onChange={() => {}} options={options} />,
    );
    expect(getByRole("radio", { name: "Remote URL" })).toHaveAttribute("aria-checked", "false");
    expect(getByRole("radio", { name: "Local server" })).toHaveAttribute("aria-checked", "true");
  });

  it("gives only the selected option a tab stop (roving tabindex)", () => {
    const { getByRole } = render(
      <SegmentedControl label="Transport" value="http" onChange={() => {}} options={options} />,
    );
    expect(getByRole("radio", { name: "Remote URL" })).toHaveAttribute("tabindex", "0");
    expect(getByRole("radio", { name: "Local server" })).toHaveAttribute("tabindex", "-1");
  });

  it("fires onChange with the option's value when clicked", () => {
    const onChange = vi.fn();
    const { getByRole } = render(
      <SegmentedControl label="Transport" value="http" onChange={onChange} options={options} />,
    );
    getByRole("radio", { name: "Local server" }).click();
    expect(onChange).toHaveBeenCalledWith("stdio");
  });

  it("ArrowRight advances the selection to the next option", () => {
    const onChange = vi.fn();
    const { getByRole } = render(
      <SegmentedControl label="Transport" value="http" onChange={onChange} options={options} />,
    );
    fireEvent.keyDown(getByRole("radio", { name: "Remote URL" }), { key: "ArrowRight" });
    expect(onChange).toHaveBeenCalledWith("stdio");
  });

  it("ArrowLeft wraps from the first option round to the last", () => {
    const onChange = vi.fn();
    const { getByRole } = render(
      <SegmentedControl label="Transport" value="http" onChange={onChange} options={options} />,
    );
    fireEvent.keyDown(getByRole("radio", { name: "Remote URL" }), { key: "ArrowLeft" });
    expect(onChange).toHaveBeenCalledWith("stdio");
  });

  it("does not select a disabled option", () => {
    const onChange = vi.fn();
    const opts = [
      { value: "http", label: "Remote URL" },
      { value: "stdio", label: "Local server", disabled: true },
    ];
    const { getByRole } = render(
      <SegmentedControl label="Transport" value="http" onChange={onChange} options={opts} />,
    );
    const locked = getByRole("radio", { name: "Local server" });
    expect(locked).toBeDisabled();
    locked.click();
    expect(onChange).not.toHaveBeenCalled();
  });

  it("renders a note as supplementary text within its option", () => {
    const { getByRole } = render(
      <SegmentedControl
        label="Transport"
        value="http"
        onChange={() => {}}
        options={[{ value: "http", label: "Remote URL", note: "default" }]}
      />,
    );
    expect(getByRole("radio", { name: /Remote URL/ })).toHaveTextContent("default");
  });
});
