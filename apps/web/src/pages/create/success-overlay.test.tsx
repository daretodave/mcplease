import { fireEvent, render, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { SuccessOverlay } from "./success-overlay";

const BASE = {
  slug: "sunny-otter-42",
  editUrl: "https://mcplease.io/e/0000-uuid",
  autoMinted: false,
  onClose: () => {},
  onView: () => {},
};

describe("SuccessOverlay", () => {
  it("shows the share link and the one-time edit link", () => {
    const { getByRole, getByText } = render(<SuccessOverlay {...BASE} />);
    expect(getByRole("dialog", { name: "Your link is live" })).toBeInTheDocument();
    // the share URL carries the slug; the edit URL is shown verbatim
    expect(getByText(new RegExp(BASE.slug))).toBeInTheDocument();
    expect(getByText(BASE.editUrl)).toBeInTheDocument();
  });

  it("gates 'View my connect page' behind the saved-it acknowledgment", () => {
    const onView = vi.fn();
    const { getByRole } = render(<SuccessOverlay {...BASE} onView={onView} />);
    const view = getByRole("button", { name: /view my connect page/i });
    expect(view).toBeDisabled();

    view.click();
    expect(onView).not.toHaveBeenCalled(); // still gated

    getByRole("checkbox").click();
    expect(view).not.toBeDisabled();
    view.click();
    expect(onView).toHaveBeenCalledTimes(1);
  });

  it("shows the mint hint only when the slug was auto-minted", () => {
    const claimed = render(<SuccessOverlay {...BASE} autoMinted={false} />);
    expect(claimed.queryByText(/claim a custom slug anytime/i)).toBeNull();

    const minted = render(<SuccessOverlay {...BASE} autoMinted />);
    expect(minted.getByText(/claim a custom slug anytime/i)).toBeInTheDocument();
  });

  it("dismisses via the close button, Escape, and a backdrop click", () => {
    const onClose = vi.fn();
    const { getByRole, container } = render(<SuccessOverlay {...BASE} onClose={onClose} />);

    within(getByRole("dialog")).getByRole("button", { name: "Close" }).click();
    expect(onClose).toHaveBeenCalledTimes(1);

    fireEvent.keyDown(document, { key: "Escape" });
    expect(onClose).toHaveBeenCalledTimes(2);

    // the backdrop's transparent close surface sits before the dialog; clicking inside the card does not close
    const backdropButton = container.querySelector("button");
    fireEvent.click(backdropButton as Element);
    expect(onClose).toHaveBeenCalledTimes(3);
    fireEvent.click(getByRole("dialog"));
    expect(onClose).toHaveBeenCalledTimes(3);
  });
});
