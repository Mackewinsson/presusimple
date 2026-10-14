import { render, screen } from "@testing-library/react";
import { ReferralInviteBanner } from "./ReferralInviteBanner";

const params = new URLSearchParams();

jest.mock("next/navigation", () => ({
  useSearchParams: () => params,
}));

describe("ReferralInviteBanner", () => {
  beforeEach(() => {
    params.delete("ref");
  });

  it("shows the invite when the landing link has a valid ref", async () => {
    params.set("ref", "EA369D0B");

    render(<ReferralInviteBanner />);

    expect(
      await screen.findByText(
        "You're invited. Sign up and you both get 30 days of Pro free."
      )
    ).toBeInTheDocument();
  });

  it("stays hidden for a normal visit or a malformed ref", () => {
    const { rerender } = render(<ReferralInviteBanner />);
    expect(screen.queryByRole("status")).not.toBeInTheDocument();

    params.set("ref", "not-a-code");
    rerender(<ReferralInviteBanner />);
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });
});
