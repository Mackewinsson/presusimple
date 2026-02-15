import { render, screen } from "@testing-library/react";
import AccessRestricted from "./AccessRestricted";
import { useCheckout } from "@/hooks/useCheckout";

const mockCheckout = jest.fn();
jest.mock("@/hooks/useCheckout", () => ({
  useCheckout: jest.fn(),
}));

describe("AccessRestricted", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useCheckout as jest.Mock).mockReturnValue({
      checkout: mockCheckout,
      loading: false,
      canCheckout: true,
      error: "",
    });
  });

  it("displays checkout error when useCheckout returns an error", () => {
    (useCheckout as jest.Mock).mockReturnValue({
      checkout: mockCheckout,
      loading: false,
      canCheckout: true,
      error: "Some error message",
    });

    render(<AccessRestricted reason="trial_expired" />);

    expect(screen.getByText("Some error message")).toBeInTheDocument();
  });

  it("does not display error UI when useCheckout has no error", () => {
    render(<AccessRestricted reason="trial_expired" />);

    expect(screen.queryByText("Some error message")).not.toBeInTheDocument();
  });
});
